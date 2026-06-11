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
    joinRequestsSnap,
    contactsSnap
  ] = await Promise.all([
    db.collection('users').count().get(),
    db.collection('events').count().get(),
    db.collection('ctfChallenges').count().get(), // Check collection name for CTF challenges
    db.collection('ctfSubmissions').where('status', '==', 'PENDING').count().get(),
    db.collection('blogs').count().get(),
    db.collection('achievements').count().get(),
    db.collection('joinRequests').orderBy('createdAt', 'desc').limit(5).get(),
    db.collection('contacts').where('status', '==', 'NEW').count().get(),
  ]);

  const totalUsers = usersSnap.data().count;
  const totalEvents = eventsSnap.data().count;
  const totalChallenges = challengesSnap.data().count;
  const pendingSubmissions = submissionsSnap.data().count;
  const totalBlogPosts = blogsSnap.data().count;
  const totalAchievements = achievementsSnap.data().count;
  const unreadMessages = contactsSnap.data().count;

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
  // In a production app, user growth should be tracked in a separate daily-aggregated stats collection.
  // For efficiency, we will not fetch all users to calculate this dynamically.
  const userGrowth = [
    { date: new Date().toISOString().split('T')[0], count: totalUsers }
  ];

  return {
    totalUsers,
    totalEvents,
    totalChallenges,
    pendingSubmissions,
    totalBlogPosts,
    totalAchievements,
    unreadMessages,
    recentJoinRequests,
    submissionsThisWeek,
    userGrowth
  };
};
