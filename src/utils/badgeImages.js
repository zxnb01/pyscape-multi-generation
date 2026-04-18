import badgeFirstLesson from "../images/first_lesson_badge.png";
import badge10Lessons from "../images/10_lessons_badge.png";
import badge50Lessons from "../images/50_lessons_badge.png";
import badgeProjectStarted from "../images/project_started.png";
import badgeProjectBuilder from "../images/project_builder.png";
import badgeProjectMaster from "../images/project_master.png";
import badge3Streak from "../images/3streak.png";
import badge7Streak from "../images/7streak.png";
import badge14Streak from "../images/14streak.png";
import badge30Streak from "../images/30streak.png";
import badge100Streak from "../images/100streak.png";
import badge500XP from "../images/500xp.png";
import badge1000XP from "../images/1000xp.png";
import badge2500XP from "../images/2500xp.png";
import badge5000XP from "../images/5000xp.png";
import badge10000XP from "../images/10000xp.png";
import badge25000XP from "../images/25000xp.png";

const badgeImageMap = {
  streak: {
    3: badge3Streak,
    7: badge7Streak,
    14: badge14Streak,
    30: badge30Streak,
    100: badge100Streak
  },
  xp: {
    500: badge500XP,
    1000: badge1000XP,
    2500: badge2500XP,
    5000: badge5000XP,
    10000: badge10000XP,
    25000: badge25000XP
  },
  lesson: {
    1: badgeFirstLesson,
    10: badge10Lessons,
    50: badge50Lessons
  },
  project: {
    1: badgeProjectStarted,
    5: badgeProjectBuilder,
    10: badgeProjectMaster
  }
};

export const getBadgeImagePath = (badge) => {
  const badgeType = badge?.badge_type;
  const value = Number(badge?.requirement_value);

  const badgeTypeMap = badgeImageMap[badgeType];
  if (badgeTypeMap && badgeTypeMap[value]) {
    return badgeTypeMap[value];
  }

  // Fallback image if the badge type or value isn't mapped correctly
  return badgeFirstLesson;
};