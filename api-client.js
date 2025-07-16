class APIClient {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.eventHandlers = {};
    this.db = null;
    this.initializeFirestore();
  }

  async initializeFirestore() {
    // Firebase初期化を待つ
    const waitForFirebase = () => {
      return new Promise((resolve) => {
        if (window.firebase && window.firebase.db) {
          resolve();
        } else {
          setTimeout(() => waitForFirebase().then(resolve), 100);
        }
      });
    };

    await waitForFirebase();
    this.db = window.firebase.db;
    console.log('Firestore initialized successfully');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Firestore操作用のヘルパー
  async getFirestoreCollection(collectionName) {
    if (!this.db) {
      await this.initializeFirestore();
    }
    
    // Firestore関数を動的にインポート
    const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    try {
      const applicantsRef = collection(this.db, collectionName);
      const q = query(applicantsRef, orderBy('applicationDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      
      return results;
    } catch (error) {
      console.error('Firestore read error:', error);
      return this.getLocalStorageFallback();
    }
  }

  async addFirestoreDocument(collectionName, data) {
    if (!this.db) {
      await this.initializeFirestore();
    }
    
    const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    try {
      const docRef = await addDoc(collection(this.db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Firestore add error:', error);
      throw error;
    }
  }

  async updateFirestoreDocument(collectionName, docId, data) {
    if (!this.db) {
      await this.initializeFirestore();
    }
    
    const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    try {
      const docRef = doc(this.db, collectionName, docId);
      // setDocのmergeオプションで部分更新を確実に行う
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return { id: docId, ...data };
    } catch (error) {
      console.error('Firestore update error:', error);
      throw error;
    }
  }

  async deleteFirestoreDocument(collectionName, docId) {
    if (!this.db) {
      await this.initializeFirestore();
    }
    
    const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    try {
      await deleteDoc(doc(this.db, collectionName, docId));
      return { success: true };
    } catch (error) {
      console.error('Firestore delete error:', error);
      throw error;
    }
  }

  // ローカルストレージフォールバック
  getLocalStorageFallback() {
    try {
      const data = localStorage.getItem('careFacilityApplicants');
      return data ? JSON.parse(data) : this.getDefaultApplicants();
    } catch (error) {
      return this.getDefaultApplicants();
    }
  }

  getDefaultApplicants() {
    return [
      {
        id: 'default-1',
        applicationDate: '2024-12-15',
        name: '田中太郎',
        surname: '田中',
        given_name: '太郎',
        age: 85,
        careLevel: '要介護3',
        status: '実調完了',
        assignee: '藤堂　友未枝',
        address: '東京都新宿区1-1-1',
        kp: '田中花子（長女）',
        kpRelationship: '長女',
        kpContact: '090-1234-5678',
        kpAddress: '東京都渋谷区2-2-2',
        careManager: '山田ケアマネ',
        careManagerName: '山田太郎',
        cmContact: '048-123-4567',
        notes: '夜間のトイレ介助が必要。家族の協力体制は良好。',
        timeline: []
      },
      {
        id: 'default-2',
        applicationDate: '2024-12-20',
        name: '山田花子',
        surname: '山田',
        given_name: '花子',
        age: 78,
        careLevel: '要介護4',
        status: '申込書受領',
        assignee: '吉野　隼人',
        address: '神奈川県横浜市3-3-3',
        kp: '山田太郎（長男）',
        kpRelationship: '長男',
        kpContact: '080-9876-5432',
        kpAddress: '神奈川県川崎市4-4-4',
        careManager: '佐藤ケアマネ',
        careManagerName: '佐藤花子',
        cmContact: '048-987-6543',
        timeline: []
      }
    ];
  }

  // 認証関連
  async login(username, password) {
    // 仮の認証（実際の実装では適切な認証を行う）
    return { token: 'mock-token', user: { username } };
  }

  logout() {
    this.clearToken();
  }

  // 申込者関連
  async getApplicants() {
    try {
      return await this.getFirestoreCollection('applicants');
    } catch (error) {
      console.error('Failed to get applicants:', error);
      return this.getLocalStorageFallback();
    }
  }

  async getApplicant(id) {
    try {
      if (!this.db) {
        await this.initializeFirestore();
      }
      
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      
      const docRef = doc(this.db, 'applicants', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Failed to get applicant:', error);
      // フォールバック：全データから検索
      try {
        const applicants = await this.getApplicants();
        return applicants.find(app => app.id === id);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return null;
      }
    }
  }

  async createApplicant(data) {
    try {
      const applicantData = {
        applicationDate: new Date().toISOString().split('T')[0],
        name: `${data.surname}　${data.givenName}`,
        surname: data.surname,
        given_name: data.givenName,
        age: data.age,
        careLevel: data.careLevel,
        address: data.address || '',
        kp: data.kp || '',
        kpRelationship: data.kpRelationship || '',
        kpContact: data.kpContact || '',
        kpAddress: data.kpAddress || '',
        careManager: data.careManager || '',
        careManagerName: data.careManagerName || '',
        cmContact: data.cmContact || '',
        assignee: data.assignee || '担当者未定',
        notes: data.notes || '',
        status: '申込書受領',
        timeline: []
      };

      const result = await this.addFirestoreDocument('applicants', applicantData);
      return { id: result.id, message: '申込者が登録されました' };
    } catch (error) {
      console.error('Failed to create applicant:', error);
      throw error;
    }
  }

  async updateApplicant(id, data) {
    try {
      // 更新対象の基本フィールドのみを送信（timelineは触らない）
      const updateData = {
        name: `${data.surname}　${data.givenName}`,
        surname: data.surname,
        given_name: data.givenName,
        age: data.age,
        careLevel: data.careLevel,
        address: data.address || '',
        kp: data.kp || '',
        kpRelationship: data.kpRelationship || '',
        kpContact: data.kpContact || '',
        kpAddress: data.kpAddress || '',
        careManager: data.careManager || '',
        careManagerName: data.careManagerName || '',
        cmContact: data.cmContact || '',
        assignee: data.assignee || '担当者未定',
        notes: data.notes || ''
      };

      // setDocのmerge:trueにより、timelineや他の既存フィールドは自動的に保持される
      await this.updateFirestoreDocument('applicants', id, updateData);
      return { message: '申込者情報が更新されました' };
    } catch (error) {
      console.error('Failed to update applicant:', error);
      throw error;
    }
  }

  async deleteApplicant(id) {
    try {
      await this.deleteFirestoreDocument('applicants', id);
      return { message: '申込者が削除されました' };
    } catch (error) {
      console.error('Failed to delete applicant:', error);
      throw error;
    }
  }

  // 投稿関連
  async createPost(applicantId, content, action = null, parentPostId = null) {
    // 今後実装予定
    return { message: '投稿が作成されました' };
  }

  // WebSocket関連（GitHub Pages環境では無効化）
  connectSocket() {
    // GitHub Pages環境のため、WebSocket接続は無効化
    console.log('Firebase環境のため、WebSocket接続はスキップされます');
    return null;
  }

  disconnectSocket() {
    // Firebase環境では何もしない
    console.log('Firebase環境のため、WebSocket切断はスキップされます');
  }

  joinApplicantPage(applicantId) {
    // Firebase環境では何もしない
    console.log('Firebase環境のため、申込者ページ参加はスキップされます');
  }

  leaveApplicantPage(applicantId) {
    // Firebase環境では何もしない
    console.log('Firebase環境のため、申込者ページ退出はスキップされます');
  }

  on(event, handler) {
    this.eventHandlers[event] = handler;
  }

  off(event) {
    delete this.eventHandlers[event];
  }
}

// グローバルに利用可能にする
window.apiClient = new APIClient();