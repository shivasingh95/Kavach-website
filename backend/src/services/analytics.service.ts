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

  const recentJoinRequests = joinRequestsSnap.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      ...d,
      // Map Firestore Timestamp → ISO string; expose as appliedAt (frontend field name)
      appliedAt: (d.createdAt?.toDate() ?? new Date()).toISOString(),
      createdAt: undefined,
    };
  });

  // For submissionsThisWeek, get submissions from last 7 days and populate
  // nested challenge + user objects so the frontend can render them directly.
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const weeklySubmissionsSnap = await db.collection('ctfSubmissions')
    .where('submittedAt', '>=', sevenDaysAgo)
    .orderBy('submittedAt', 'desc')
    .limit(10)
    .get();

  // Collect unique challengeId and userId values to batch-fetch in parallel
  const rawSubs = weeklySubmissionsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    submittedAt: (doc.data().submittedAt as FirebaseFirestore.Timestamp)?.toDate() ?? new Date(),
  })) as any[];

  const uniqueChallengeIds = [...new Set(rawSubs.map((s: any) => s.challengeId).filter(Boolean))];
  const uniqueUserIds      = [...new Set(rawSubs.map((s: any) => s.userId).filter(Boolean))];

  const [challengeDocs, userDocs] = await Promise.all([
    uniqueChallengeIds.length
      ? Promise.all(uniqueChallengeIds.map(id => db.collection('ctfChallenges').doc(id as string).get()))
      : Promise.resolve([]),
    uniqueUserIds.length
      ? Promise.all(uniqueUserIds.map(id => db.collection('users').doc(id as string).get()))
      : Promise.resolve([]),
  ]);

  const challengeMap = new Map<string, { id: string; title: string; category: string }>();
  for (const cdoc of challengeDocs) {
    if (cdoc.exists) {
      const d = cdoc.data()!;
      challengeMap.set(cdoc.id, { id: cdoc.id, title: d.title ?? '', category: d.category ?? '' });
    }
  }

  const userMap = new Map<string, { id: string; name: string; email: string }>();
  for (const udoc of userDocs) {
    if (udoc.exists) {
      const d = udoc.data()!;
      userMap.set(udoc.id, { id: udoc.id, name: d.name ?? '', email: d.email ?? '' });
    }
  }

  const submissionsThisWeek = rawSubs.map((s: any) => ({
    id: s.id,
    user: userMap.get(s.userId) ?? { id: s.userId ?? '', name: 'Unknown', email: '' },
    challenge: challengeMap.get(s.challengeId) ?? { id: s.challengeId ?? '', title: 'Unknown', category: '' },
    submittedAt: s.submittedAt,
    status: s.status ?? 'PENDING',
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
