const USERNAME = 'Alhussein76';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; portfolio-stats/1.0)',
  Accept: 'application/json',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

  try {
    const [rankRes, badgesRes] = await Promise.all([
      fetch(`https://tryhackme.com/api/user/rank/${USERNAME}`, { headers: HEADERS }),
      fetch(`https://tryhackme.com/api/badges/get/${USERNAME}`, { headers: HEADERS }),
    ]);

    if (!rankRes.ok) throw new Error(`THM rank API returned ${rankRes.status}`);

    const [rankData, badgesData] = await Promise.all([
      rankRes.json(),
      badgesRes.ok ? badgesRes.json() : Promise.resolve([]),
    ]);

    const user = rankData.userRank ?? rankData;

    res.json({
      username: USERNAME,
      rank:           user.rank           ?? null,
      points:         user.points         ?? null,
      completedRooms: user.completedRooms ?? user.rooms ?? null,
      streak:         user.dayStreak      ?? null,
      country:        user.country        ?? null,
      badgeCount:     Array.isArray(badgesData) ? badgesData.length : (badgesData?.badges?.length ?? null),
      badges:         Array.isArray(badgesData) ? badgesData.slice(0, 6) : [],
      badgeImageUrl:  `https://tryhackme-badges.s3.amazonaws.com/${USERNAME}.png`,
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};
