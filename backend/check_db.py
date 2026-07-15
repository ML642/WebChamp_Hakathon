import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@localhost:5432/webchamp_hackaton')
    rows = await conn.fetch("SELECT text, reference_answer FROM questions WHERE text LIKE '%mentor comment%'")
    print([dict(r) for r in rows])
    await conn.close()

asyncio.run(main())
