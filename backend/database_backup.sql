-- Database Export/Backup Script for ONBOARDING_USER
-- Run this in Oracle SQLcl or use standard Data Pump (expdp)

-- Option 1: Using SQLcl to export the entire schema DDL and Data
-- spool backup_output.sql
-- ddl ONBOARDING_USER
-- select /*insert*/ * from departments;
-- select /*insert*/ * from users;
-- select /*insert*/ * from onboarding_tasks;
-- select /*insert*/ * from trainings;
-- select /*insert*/ * from assets;
-- select /*insert*/ * from onboarding_faqs;
-- spool off

-- Option 2: Using Oracle Data Pump (Run from OS terminal, not SQL)
-- expdp ONBOARDING_USER/onboarding123@localhost:1521/XEPDB1 schemas=ONBOARDING_USER directory=DATA_PUMP_DIR dumpfile=onboarding_backup.dmp logfile=expdp.log
