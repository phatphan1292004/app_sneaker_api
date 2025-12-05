// Check MongoDB collections and data
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkMongoDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('app-sneaker');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📚 Collections in database:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Check each collection
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`\n📊 Collection "${col.name}": ${count} documents`);
      
      if (count > 0) {
        const docs = await db.collection(col.name).find({}).limit(2).toArray();
        console.log(`Sample documents:`);
        docs.forEach(doc => {
          console.log(`  - ${doc.name} (slug: ${doc.slug})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkMongoDB();
