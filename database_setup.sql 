-- ================================================
-- TASK MANAGEMENT APPLICATION - DATABASE SETUP
-- PostgreSQL Database Schema
-- ================================================

-- KULLANIM:
-- 1. PostgreSQL'de 'task_management' database'i oluşturun
-- 2. Bu dosyayı pgAdmin Query Tool'da çalıştırın

-- ================================================
-- USERS TABLOSU
-- ================================================

CREATE TABLE IF NOT EXISTS public.users
(
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TASKS TABLOSU
-- ================================================

CREATE TABLE IF NOT EXISTS public.tasks
(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'todo',
    due_date DATE,
    due_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP,
    CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id)
        ON DELETE CASCADE
);

-- ================================================
-- INDEX'LER (Performans için)
-- ================================================

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);


