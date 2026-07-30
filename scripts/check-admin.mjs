import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load credentials from your .env values
const app = initializeApp({
  credential: cert({
    projectId: 'kavach-web-b42a9',
    clientEmail: 'firebase-adminsdk-fbsvc@kavach-web-b42a9.iam.gserviceaccount.com',
    privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQC9UMyTL6T0t7dT\nL0cNznbVk9cLTWHzazl9m1pGZ9rKRpgwGfVvbWxdH4wpt484dJz1vRvzIN9aSYwc\nRctM2MnhVm/06FRPoW0bTfU+EuGr1QcOltn7Wn/7AluukdXdz+yaKBVwtOdGMlvS\nJ5VJZ3zNWZHiM3T92L2xPhV2pRYZHTFvNKfHyXZtKYKFTItQCrRYVJyqVyWYN2Ji\nO3h4B/kI2wtBK95TDB4wq5Z4KNQkwnDSmfXSozkXJJ3pCWmbG5bs8Zb5t4UE+pEs\nf/taSRMvEZ0TR0ZuAJRfixpD0ye45UVgbhxeSZ1a/poZQOzIDSFL5cEiWTEFgVse\nNnmkorH/AgMBAAECgf8xLUv27+lpqE92zFEoxPkZgc3aob9P/ApzFmfc4h1zbeMa\nm6OlzkbX6dn+/C+3+pLLQtR/04oxael7bqXg0G+gmVN7yt4b0VMGRLnv5fe5Kx0q\nLQVyxY95JKOsNTXY6KoNYVwwas2o7mvrq1ycNMW2kg3TNIqvZh3gbMAmkburyfcs\nacR4heC6jjnLkxmWWgWPMDvVjGdnP4F7pnGXotPO4Mgpx+ugtmAKkjOvogMVlgJ3\ntLnYsZyUgfyCB5keGDYyh6rH5Mh7Z4iKNN+jdvlIF5Z8VO5R9t4DqcF+HG13IiJL\nJtn8NggvbYxzJ9+q5R4G+YsPY9LPypy9ejdpW1ECgYEA3lUbvo1Ud3aKwW7YyMNg\nmtHWMvhvEs2tg2Ldd5gswdlYD5bTK/+qqVmGh48MFJLrl9BKi3mqejZp/cwZm5YS\nM1gj5qutotxVpNLeJw0ye/SfES+TedBl5XuIYonJfo9MraW3jVqLe8/q8MD8DrQN\nSc5dJZ630GfFnMERaX98yXECgYEA2fvEclY2D1FXthz+wABW6b9t4t8EB22P/tRr\nwljP+c567/UsGp3v4ZP7s3RVuuJN0wdBMlOBkY2AoA15+6X6pdNkWH3sw9cUgMZs\nRIlhOeOTxVWTZgQFwEvVaDW8+bXfbao29m1d0wZrTWyntlZVXJoNJfdgYcPJgpKx\nvc4/+m8CgYAlRse8Dx4WWX2yKM+X+Yn86ymqqhSVZn6tBKp1HsKCTdqB4pvNSLRo\naGYx3D3+RRPTBE07TU7T5sOmlc3FVEgA68o5JpeaMq75T5GHoqLQPZdd3kgvqE0t\nSKT5QHjUC1qj0qEPxhqUy6tsai7YmD+SHFNpt07CVmO/gG9W7NUTQQKBgQDSu4e9\ntUSL6GpwH3XULj/Xt/3Gjy049R15EOigOPXOnWPSKOYbUUY/gK2bXkMm6XKtKV1J\nBtvC19ZaZMzhkCNRPpzKw+oppfsnRywR0fIRYcZQxps5y3e34FgOZ60qhz3Zqe16\nrF5BDPqdHgbAypO5cyB07MLboMhll+WHBiZptwKBgEsC5GAhkOPAo/XUmm2ZY/Ik\niAejwN2nPnQ3QJVBA8WIZFbC1jbDqFQRpjq7kzFAV5Gko4exfQFXO2D4AVL3IrNx\n0N8lGRmw2+/ukiV1GpG2uhJZROD/8DHbivxt4GGTj9o6+03TNMXFTR+rnOOQofVW\n7AAbBCnUKQgFOaB7G+V5\n-----END PRIVATE KEY-----\n`,
  }),
});

const db = getFirestore(app);

async function checkAndFixAdmin() {
  console.log('🔍 Searching for admin@gmail.com in Firestore users collection...\n');

  const snapshot = await db
    .collection('users')
    .where('email', '==', 'admin@gmail.com')
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.log('❌ No user found with email: admin@gmail.com');
    console.log('\n📋 Listing ALL users in the collection:');
    const allUsers = await db.collection('users').get();
    allUsers.forEach(doc => {
      const data = doc.data();
      console.log(`  • [${doc.id}] email: ${data.email} | role: ${data.role} | isActive: ${data.isActive}`);
    });
    return;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  console.log('✅ User found!');
  console.log('─────────────────────────────────');
  console.log(`  ID       : ${doc.id}`);
  console.log(`  Email    : ${data.email}`);
  console.log(`  Name     : ${data.name}`);
  console.log(`  Role     : ${data.role}`);
  console.log(`  isActive : ${data.isActive}`);
  console.log(`  isVerified: ${data.isVerified}`);
  console.log('─────────────────────────────────');

  if (!data.isActive) {
    console.log('\n⚠️  Account is DEACTIVATED. Fixing now...');
    await doc.ref.update({ isActive: true });
    console.log('✅ Account reactivated! isActive is now TRUE.');
  } else {
    console.log('\n✅ Account is already ACTIVE. No fix needed.');
  }

  if (data.role !== 'ADMIN') {
    console.log(`\n⚠️  Role is "${data.role}" — not ADMIN. Updating to ADMIN...`);
    await doc.ref.update({ role: 'ADMIN' });
    console.log('✅ Role updated to ADMIN.');
  } else {
    console.log('✅ Role is already ADMIN.');
  }
}

checkAndFixAdmin()
  .then(() => {
    console.log('\n🎉 Done! Try logging in now.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
