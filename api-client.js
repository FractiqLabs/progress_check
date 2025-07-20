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
        status: '入居日調整中',
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
        timeline: [
          {
            id: '1',
            author: '藤堂　友未枝',
            content: '申込書を受領しました。',
            action: '申込書受領',
            parentPostId: null,
            createdAt: '2024-12-15T10:00:00Z',
            timestamp: '2024-12-15 10:00',
            replies: []
          },
          {
            id: '2',
            author: '藤堂　友未枝',
            content: '実地調査を完了しました。入居に向けて検討を進めます。',
            action: '実調完了',
            parentPostId: null,
            createdAt: '2024-12-18T14:30:00Z',
            timestamp: '2024-12-18 14:30',
            replies: []
          },
          {
            id: '2-1',
            author: '田中　慎治',
            content: '入所判定会議をネッツにて開催する。',
            action: '判定会議中',
            parentPostId: null,
            createdAt: '2024-12-19T10:00:00Z',
            timestamp: '1日前',
            replies: []
          }
        ]
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
        timeline: [
          {
            id: '3',
            author: '吉野　隼人',
            content: '申込書を受領いたしました。内容を確認して次のステップに進みます。',
            action: '申込書受領',
            parentPostId: null,
            createdAt: '2024-12-20T09:15:00Z',
            timestamp: '2024-12-20 09:15',
            replies: []
          }
        ]
      }
    ];
  }

  // タイムライン同期用ヘルパーメソッド
  getLatestTimelineAction(timeline) {
    if (!timeline || timeline.length === 0) {
      return null;
    }
    
    // タイムラインを作成日時順でソートし、最新のアクション投稿を取得
    const actionPosts = timeline
      .filter(post => post.action && post.action.trim() !== '')
      .sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));
    
    return actionPosts.length > 0 ? actionPosts[0].action : null;
  }

  syncStatusWithTimeline(currentStatus, latestTimelineAction) {
    if (!latestTimelineAction) {
      return currentStatus;
    }
    
    // アクションからステータスへのマッピング
    const statusMapping = {
      '申込書受領': '申込書受領',
      '実調日程調整中': '実調日程調整中',
      '実調完了': '実調完了',
      '健康診断書依頼': '健康診断書待ち',
      '健康診断書受領': '健康診断書受領',
      '判定会議中': '判定会議中',
      '入居決定': '入居決定',
      '入居日調整中': '入居日調整中',
      '書類送付済': '書類送付済',
      '入居準備完了': '入居準備完了',
      '入居完了': '入居完了'
    };
    
    // 最新のタイムライン投稿のアクションに対応するステータスを返す
    return statusMapping[latestTimelineAction] || currentStatus;
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
      const applicants = await this.getFirestoreCollection('applicants');
      
      // 各申込者のステータスを最新のタイムライン投稿のアクションと同期
      return applicants.map(applicant => {
        const latestTimelineAction = this.getLatestTimelineAction(applicant.timeline);
        const syncedStatus = this.syncStatusWithTimeline(applicant.status, latestTimelineAction);
        
        return {
          ...applicant,
          status: syncedStatus
        };
      });
    } catch (error) {
      console.error('Failed to get applicants:', error);
      const fallbackData = this.getLocalStorageFallback();
      
      // フォールバックデータでも同じ同期処理を適用
      return fallbackData.map(applicant => {
        const latestTimelineAction = this.getLatestTimelineAction(applicant.timeline);
        const syncedStatus = this.syncStatusWithTimeline(applicant.status, latestTimelineAction);
        
        return {
          ...applicant,
          status: syncedStatus
        };
      });
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
        const applicant = { id: docSnap.id, ...docSnap.data() };
        
        // ステータスを最新のタイムライン投稿のアクションと同期
        const latestTimelineAction = this.getLatestTimelineAction(applicant.timeline);
        const syncedStatus = this.syncStatusWithTimeline(applicant.status, latestTimelineAction);
        
        return {
          ...applicant,
          status: syncedStatus
        };
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
    try {
      if (!this.db) {
        await this.initializeFirestore();
      }

      // 現在のユーザー名を取得
      let authorName = 'ローカルユーザー';
      try {
        if (this.token) {
          const payload = JSON.parse(atob(this.token.split('.')[1]));
          authorName = payload.name || payload.username || 'ローカルユーザー';
        }
      } catch (error) {
        console.warn('Failed to parse token for author name:', error);
      }

      const { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      // 新しい投稿オブジェクトを作成
      const newPost = {
        id: Date.now().toString(),
        author: authorName,
        content,
        action,
        parentPostId: parentPostId || null,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toLocaleString('ja-JP'),
        replies: []
      };

      // 申込者のドキュメントを取得
      const applicantRef = doc(this.db, 'applicants', applicantId);
      const applicantSnap = await getDoc(applicantRef);

      if (!applicantSnap.exists()) {
        throw new Error('申込者が見つかりません');
      }

      const applicantData = applicantSnap.data();
      let timeline = applicantData.timeline || [];

      if (parentPostId) {
        // 返信の場合：親投稿にreplyを追加
        timeline = timeline.map(post => {
          if (post.id === parentPostId) {
            return {
              ...post,
              replies: [...(post.replies || []), newPost]
            };
          }
          return post;
        });
      } else {
        // 新規投稿の場合：タイムラインの先頭に追加
        timeline = [newPost, ...timeline];
      }

      // ステータス更新が必要な場合のロジック
      let updateData = { 
        timeline,
        updatedAt: serverTimestamp()
      };

      if (action && !parentPostId) {
        const statusMapping = {
          '申込書受領': '申込書受領',
          '実調日程調整中': '実調日程調整中',
          '実調完了': '実調完了',
          '健康診断書依頼': '健康診断書待ち',
          '健康診断書受領': '健康診断書受領',
          '判定会議中': '判定会議中',
          '入居決定': '入居決定',
          '入居不可': '入居不可',
          '入居日調整中': '入居日調整中',
          '書類送付済': '書類送付済',
          '入居準備完了': '入居準備完了',
          '入居完了': '入居完了',
          'キャンセル': 'キャンセル'
        };

        if (statusMapping[action]) {
          updateData.status = statusMapping[action];
        }
      }

      // Firestoreドキュメントを更新
      await updateDoc(applicantRef, updateData);

      return {
        id: newPost.id,
        message: '投稿が作成されました',
        post: newPost
      };
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
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