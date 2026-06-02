def auto_assign_tasks_and_trainings(conn, user_id: int, department_id: int, joining_date):
    cursor = conn.cursor()
    
    # Assign tasks
    cursor.execute(
        "SELECT task_id, default_due_days FROM ONBOARDING_TASKS WHERE department_id = :1 OR department_id IS NULL",
        [department_id]
    )
    tasks = cursor.fetchall()
    
    for task in tasks:
        task_id, due_days = task
        from datetime import timedelta
        due_days_val = due_days if due_days is not None else 7
        due_date = joining_date + timedelta(days=due_days_val)
        cursor.execute(
            "INSERT INTO TASK_ASSIGNMENTS (task_id, user_id, status, due_date) VALUES (:1, :2, 'Pending', :3)",
            [task_id, user_id, due_date]
        )
        
    # Assign mandatory trainings
    cursor.execute("SELECT training_id FROM TRAININGS WHERE is_mandatory = 1")
    trainings = cursor.fetchall()
    for training in trainings:
        t_id = training[0]
        cursor.execute(
            "INSERT INTO TRAINING_ASSIGNMENTS (training_id, user_id, status) VALUES (:1, :2, 'Pending')",
            [t_id, user_id]
        )
        
    conn.commit()
