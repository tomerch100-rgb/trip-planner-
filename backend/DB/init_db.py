from sqlalchemy import text
from db import engine 

sql_script = """
sql for us 
"""

with engine.connect() as conn:
    conn.execute(text(sql_script))
    conn.commit()
    
print("Tables and data injected successfully!")