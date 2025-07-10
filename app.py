
from flask import Flask, render_template, request, redirect, url_for
import sqlite3
import os

# --- App Setup ---
app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)

# --- Database Setup ---
def get_db_connection():
    """Establishes a connection to the database."""
    conn = sqlite3.connect('checklist.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database and creates tables if they don't exist."""
    with app.app_context():
        conn = get_db_connection()
        with conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT '入居手続き中' -- e.g., 入居手続き中, 退居手続き中, 完了
                );
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS checklist_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    category TEXT NOT NULL, -- e.g., 契約前, 入居決定後, 退居手続き
                    item_name TEXT NOT NULL,
                    is_checked INTEGER NOT NULL DEFAULT 0, -- 0 for False, 1 for True
                    remarks TEXT,
                    display_order INTEGER,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                );
            """)
        conn.close()

# --- Routes ---
@app.route('/')
def index():
    """Main page, displays the list of users."""
    conn = get_db_connection()
    users = conn.execute('SELECT * FROM users ORDER BY id DESC').fetchall()
    
    # Calculate progress for each user
    users_with_progress = []
    for user in users:
        total_items = conn.execute('SELECT COUNT(*) FROM checklist_items WHERE user_id = ?', (user['id'],)).fetchone()[0]
        completed_items = conn.execute('SELECT COUNT(*) FROM checklist_items WHERE user_id = ? AND is_checked = 1', (user['id'],)).fetchone()[0]
        progress = (completed_items / total_items) * 100 if total_items > 0 else 0
        
        user_dict = dict(user)
        user_dict['progress'] = f"{completed_items}/{total_items}"
        user_dict['progress_percent'] = progress
        users_with_progress.append(user_dict)
        
    conn.close()
    return render_template('index.html', users=users_with_progress)

@app.route('/add_user', methods=['POST'])
def add_user():
    """Adds a new user and their initial checklist items."""
    name = request.form['name']
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO users (name) VALUES (?)', (name,))
    user_id = cursor.lastrowid
    
    # --- Define Checklist Templates ---
    admission_before_contract = [
        "入居申込書の受理", "実態調査（訪問・面談）", "健康診断の依頼", 
        "健康診断書受領", "入居判定会議", "判定結果の連絡", "入居日調整"
    ]
    admission_after_decision = ["入居決定後書類送付"]
    discharge_items = [
        "解約申し出受領", "解約届受領", "退去時チェックリスト受領", 
        "荷物返却", "保険証類返却", "薬（お薬手帳）返却"
    ]

    # --- Populate Checklist for the New User ---
    for i, item in enumerate(admission_before_contract):
        cursor.execute(
            'INSERT INTO checklist_items (user_id, category, item_name, display_order) VALUES (?, ?, ?, ?)',
            (user_id, '契約前', item, i)
        )
    for i, item in enumerate(admission_after_decision):
        cursor.execute(
            'INSERT INTO checklist_items (user_id, category, item_name, display_order) VALUES (?, ?, ?, ?)',
            (user_id, '入居決定後', item, i)
        )
    for i, item in enumerate(discharge_items):
         cursor.execute(
            'INSERT INTO checklist_items (user_id, category, item_name, display_order) VALUES (?, ?, ?, ?)',
            (user_id, '退居手続き', item, i)
        )
        
    conn.commit()
    conn.close()
    
    return redirect(url_for('index'))

@app.route('/user/<int:user_id>')
def user_details(user_id):
    """Displays the detailed checklist for a specific user."""
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    
    categories = ['契約前', '入居決定後', '退居手続き']
    checklist = {}
    for category in categories:
        items = conn.execute(
            'SELECT * FROM checklist_items WHERE user_id = ? AND category = ? ORDER BY display_order',
            (user_id, category)
        ).fetchall()
        checklist[category] = items
        
    conn.close()
    
    if user is None:
        return "User not found", 404
        
    return render_template('details.html', user=user, checklist=checklist)

@app.route('/update/<int:item_id>', methods=['POST'])
def update_item(item_id):
    """Updates the status and remarks of a checklist item."""
    is_checked = 1 if 'is_checked' in request.form else 0
    remarks = request.form['remarks']
    
    conn = get_db_connection()
    item = conn.execute('SELECT user_id FROM checklist_items WHERE id = ?', (item_id,)).fetchone()
    if item:
        conn.execute(
            'UPDATE checklist_items SET is_checked = ?, remarks = ? WHERE id = ?',
            (is_checked, remarks, item_id)
        )
        conn.commit()
        conn.close()
        return redirect(url_for('user_details', user_id=item['user_id']))
    else:
        conn.close()
        return "Item not found", 404

@app.route('/delete_user/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    """Deletes a user and all their associated checklist items."""
    conn = get_db_connection()
    conn.execute('DELETE FROM checklist_items WHERE user_id = ?', (user_id,))
    conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()
    return redirect(url_for('index'))

# --- Main Execution ---
if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5001)
