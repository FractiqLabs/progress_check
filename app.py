
from flask import Flask, render_template, request, redirect, url_for, g, flash, jsonify
import sqlite3
import os
from config import CHECKLIST_TEMPLATES

# --- App Setup ---
app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)

# --- Database Setup ---
def get_db():
    """Opens a new database connection if there is none yet for the current application context."""
    if 'db' not in g:
        g.db = sqlite3.connect('checklist.db')
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    """Closes the database again at the end of the request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    """Initializes the database and creates tables if they don't exist."""
    with app.app_context():
        conn = get_db()
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
    """Main page, displays the list of users with their progress."""
    conn = get_db()
    users = conn.execute("""
        SELECT
            u.id,
            u.name,
            u.status,
            COUNT(c.id) AS total_items,
            SUM(CASE WHEN c.is_checked = 1 THEN 1 ELSE 0 END) AS completed_items
        FROM users u
        LEFT JOIN checklist_items c ON u.id = c.user_id
        GROUP BY u.id
        ORDER BY u.id DESC
    """).fetchall()

    users_with_progress = []
    for user in users:
        user_dict = dict(user)
        total = user_dict['total_items']
        completed = user_dict['completed_items'] if user_dict['completed_items'] is not None else 0
        
        user_dict['progress'] = f"{completed}/{total}"
        user_dict['progress_percent'] = (completed / total) * 100 if total > 0 else 0
        users_with_progress.append(user_dict)

    return render_template('index.html', users=users_with_progress)

@app.route('/add_user', methods=['POST'])
def add_user():
    """Adds a new user and their initial checklist items."""
    name = request.form['name']
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO users (name) VALUES (?)', (name,))
    user_id = cursor.lastrowid
    flash(f'{name}さんを新規利用者として追加しました。', 'success')
    
    # --- Populate Checklist for the New User from Templates ---
    for category, items in CHECKLIST_TEMPLATES.items():
        for i, item_name in enumerate(items):
            cursor.execute(
                'INSERT INTO checklist_items (user_id, category, item_name, display_order) VALUES (?, ?, ?, ?)',
                (user_id, category, item_name, i)
            )
        
    conn.commit()
    
    return redirect(url_for('index'))

@app.route('/user/<int:user_id>')
def user_details(user_id):
    """Displays the detailed checklist for a specific user."""
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    
    categories = CHECKLIST_TEMPLATES.keys()
    checklist = {}
    for category in categories:
        items = conn.execute(
            'SELECT * FROM checklist_items WHERE user_id = ? AND category = ? ORDER BY display_order',
            (user_id, category)
        ).fetchall()
        checklist[category] = items
        
    
    if user is None:
        return "User not found", 404
        
    return render_template('details.html', user=user, checklist=checklist)

@app.route('/update/<int:item_id>', methods=['POST'])
def update_item(item_id):
    """Updates the status and remarks of a checklist item via AJAX."""
    is_checked = 1 if 'is_checked' in request.form else 0
    remarks = request.form['remarks']
    
    conn = get_db()
    item = conn.execute('SELECT user_id FROM checklist_items WHERE id = ?', (item_id,)).fetchone()
    if item:
        conn.execute(
            'UPDATE checklist_items SET is_checked = ?, remarks = ? WHERE id = ?',
            (is_checked, remarks, item_id)
        )
        conn.commit()
        return jsonify({'status': 'success'})
    else:
        return jsonify({'status': 'error', 'message': 'Item not found'}), 404

@app.route('/delete_user/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    """Deletes a user and all their associated checklist items."""
    conn = get_db()
    user = conn.execute('SELECT name FROM users WHERE id = ?', (user_id,)).fetchone()
    if user:
        conn.execute('DELETE FROM checklist_items WHERE user_id = ?', (user_id,))
        conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        flash(f'{user["name"]}さんの情報を削除しました。', 'danger')
    else:
        flash('指定された利用者は見つかりませんでした。', 'warning')
    return redirect(url_for('index'))

# --- Main Execution ---
if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5001)
