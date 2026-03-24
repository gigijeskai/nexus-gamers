// =============================================================================
// Nexus — prisma/seed.ts
// Esegui con: npx prisma db seed
// =============================================================================

import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  FriendshipStatus,
  UserStatusType,
  Platform,
} from "@prisma/client";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ---------------------------------------------------------------------------
  // Cleanup — ordine importante: prima le tabelle figlie, poi le madri
  // ---------------------------------------------------------------------------
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.gameIdentity.deleteMany();
  await prisma.userStatus.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Database pulito\n");

  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------
  const gamerOne = await prisma.user.create({
    data: {
      email: "gamerone@nexus.gg",
      username: "gamerone",
      nexusTag: "GamerOne#1234",
      avatarUrl: "https://api.dicebear.com/8.x/pixel-art/svg?seed=gamerone",
    },
  });

  const gamerTwo = await prisma.user.create({
    data: {
      email: "gamertwo@nexus.gg",
      username: "gamertwo",
      nexusTag: "GamerTwo#5678",
      avatarUrl: "https://api.dicebear.com/8.x/pixel-art/svg?seed=gamertwo",
    },
  });

  const gamerThree = await prisma.user.create({
    data: {
      email: "gamerthree@nexus.gg",
      username: "gamerthree",
      nexusTag: "GamerThree#9999",
      avatarUrl: "https://api.dicebear.com/8.x/pixel-art/svg?seed=gamerthree",
    },
  });

  console.log("👤 Utenti creati:");
  console.log(`   ${gamerOne.nexusTag}  → ${gamerOne.id}`);
  console.log(`   ${gamerTwo.nexusTag}  → ${gamerTwo.id}`);
  console.log(`   ${gamerThree.nexusTag} → ${gamerThree.id}\n`);

  // ---------------------------------------------------------------------------
  // UserStatus
  // ---------------------------------------------------------------------------
  await prisma.userStatus.create({
    data: {
      userId: gamerOne.id,
      status: UserStatusType.ONLINE,
      currentGame: "Valorant",
      lastSeen: new Date(),
    },
  });

  await prisma.userStatus.create({
    data: {
      userId: gamerTwo.id,
      status: UserStatusType.IN_GAME,
      currentGame: "Clash Royale",
      lastSeen: new Date(),
    },
  });

  await prisma.userStatus.create({
    data: {
      userId: gamerThree.id,
      status: UserStatusType.OFFLINE,
      currentGame: null,
      lastSeen: new Date(Date.now() - 1000 * 60 * 45),
    },
  });

  console.log("🎮 UserStatus creati:");
  console.log(`   GamerOne   → ONLINE su Valorant`);
  console.log(`   GamerTwo   → IN_GAME su Clash Royale`);
  console.log(`   GamerThree → OFFLINE (45 min fa)\n`);

  // ---------------------------------------------------------------------------
  // GameIdentities
  // ---------------------------------------------------------------------------
  await prisma.gameIdentity.create({
    data: {
      userId: gamerOne.id,
      platform: Platform.RIOT,
      platformUsername: "GamerOne#EUW",
      platformId: "riot-uid-gamer-one-001",
    },
  });

  await prisma.gameIdentity.create({
    data: {
      userId: gamerOne.id,
      platform: Platform.STEAM,
      platformUsername: "gamerone_steam",
      platformId: "76561198012345678",
    },
  });

  await prisma.gameIdentity.create({
    data: {
      userId: gamerTwo.id,
      platform: Platform.STEAM,
      platformUsername: "gamertwo_steam",
      platformId: "76561198087654321",
    },
  });

  await prisma.gameIdentity.create({
    data: {
      userId: gamerTwo.id,
      platform: Platform.PLAYSTATION,
      platformUsername: "GamerTwo_PSN",
      platformId: null,
    },
  });

  await prisma.gameIdentity.create({
    data: {
      userId: gamerThree.id,
      platform: Platform.XBOX,
      platformUsername: "GamerThreeXBL",
      platformId: "xuid-gamer-three-001",
    },
  });

  console.log("🕹️  GameIdentities create:");
  console.log(`   GamerOne   → Riot + Steam`);
  console.log(`   GamerTwo   → Steam + PlayStation`);
  console.log(`   GamerThree → Xbox\n`);

  // ---------------------------------------------------------------------------
  // Friendship — ACCEPTED tra GamerOne e GamerTwo
  // ---------------------------------------------------------------------------
  const friendship = await prisma.friendship.create({
    data: {
      requesterId: gamerOne.id,
      addresseeId: gamerTwo.id,
      status: FriendshipStatus.ACCEPTED,
    },
  });

  console.log("🤝 Amicizie create:");
  console.log(`   GamerOne ↔ GamerTwo → ACCEPTED (id: ${friendship.id})\n`);

  // ---------------------------------------------------------------------------
  // Riepilogo finale
  // ---------------------------------------------------------------------------
  const [userCount, statusCount, identityCount, friendshipCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.userStatus.count(),
      prisma.gameIdentity.count(),
      prisma.friendship.count(),
    ]);

  console.log("✅ Seed completato:");
  console.log(`   ${userCount} users`);
  console.log(`   ${statusCount} user_status`);
  console.log(`   ${identityCount} game_identities`);
  console.log(`   ${friendshipCount} friendships`);
}

main()
  .catch((e) => {
    console.error("❌ Seed fallito:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });