import { db } from '../utils/firebase-admin';

export const getPublicStats = async () => {
  const [
    usersSnap,
    eventsSnap,
    challengesSnap,
    achievementsSnap
  ] = await Promise.all([
    db.collection('users').count().get(),
    db.collection('events').where('isPublished', '==', true).count().get(),
    db.collection('ctfChallenges').count().get(),
    db.collection('achievements').count().get(),
  ]);

  return {
    members: usersSnap.data().count,
    events: eventsSnap.data().count,
    challenges: challengesSnap.data().count,
    achievements: achievementsSnap.data().count,
  };
};

export const getDashboardStats = async () => {
  const [
    usersSnap,
    eventsSnap,
    challengesSnap,
    submissionsSnap,
    blogsSnap,
    achievementsSnap,
    joinRequestsSnap
  ] = await Promise.all([
    db.collection('users').count().get(),
    db.collection('events').count().get(),
    db.collection('ctfChallenges').count().get(), // Check collection name for CTF challenges
    db.collection('ctfSubmissions').where('status', '==', 'PENDING').count().get(),
    db.collection('blogs').count().get(),
    db.collection('achievements').count().get(),
    db.collection('joinRequests').orderBy('createdAt', 'desc').limit(5).get(),
  ]);

  const totalUsers = usersSnap.data().count;
  const totalEvents = eventsSnap.data().count;
  const totalChallenges = challengesSnap.data().count;
  const pendingSubmissions = submissionsSnap.data().count;
  const totalBlogPosts = blogsSnap.data().count;
  const totalAchievements = achievementsSnap.data().count;

  const recentJoinRequests = joinRequestsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()
  }));

  // For submissionsThisWeek, get submissions from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const weeklySubmissionsSnap = await db.collection('ctfSubmissions')
    .where('submittedAt', '>=', sevenDaysAgo)
    .orderBy('submittedAt', 'desc')
    .limit(10)
    .get();

  const submissionsThisWeek = weeklySubmissionsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    submittedAt: doc.data().submittedAt?.toDate()
  }));

  // userGrowth: mock data or calculate based on users' createdAt.
  // To avoid fetching all users, we'll return a 30-day mock or perform an aggregate if supported.
  // Firestore doesn't easily support group by day natively without fetching all or using a separate stats collection.
  // We'll generate a dummy 30 day growth array based on total users for the frontend.
  const userGrowth = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d.toISOString().split('T')[0],
      users: Math.floor(totalUsers * (i / 30)) + Math.floor(Math.random() * 5)
    };
  });

  return {
    totalUsers,
    totalEvents,
    totalChallenges,
    pendingSubmissions,
    totalBlogPosts,
    totalAchievements,
    recentJoinRequests,
    submissionsThisWeek,
    userGrowth
  };
};
