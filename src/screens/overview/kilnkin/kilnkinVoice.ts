import type { KilnkinCompanion } from './kilnkinCompanion';

export type KilnkinVoiceEventKind =
  | 'kiln-finished'
  | 'firing-scheduled'
  | 'piece-drying'
  | 'stage-overage'
  | 'daily-mission'
  | 'challenge-deadline'
  | 'achievement'
  | 'weekly-summary';

export type KilnkinVoicePayload = {
  pieceName?: string;
  firingName?: string;
  stageName?: string;
  days?: number;
  missionCount?: number;
  challengeTitle?: string;
  hoursLeft?: number;
  achievementName?: string;
  totalPieces?: number;
  finishedPieces?: number;
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function pickKilnkinVariant(options: string[], seed: string): string {
  if (options.length === 0) return 'Something shifted in the studio.';
  return options[hashString(seed) % options.length];
}

function firing(p: KilnkinVoicePayload) {
  return p.firingName ?? 'your firing';
}

function piece(p: KilnkinVoicePayload) {
  return p.pieceName ?? 'that piece';
}

function stage(p: KilnkinVoicePayload) {
  return p.stageName ?? 'this stage';
}

function snackLead(companion: KilnkinCompanion) {
  return companion.favoriteSnack.split(' and ')[0];
}

type MessageTemplate = (companion: KilnkinCompanion, payload: KilnkinVoicePayload) => string;
type MessageBank = Record<KilnkinVoiceEventKind, MessageTemplate[]>;

const EMBER: MessageBank = {
  'kiln-finished': [
    (c, p) => `*yip!* Woke on ${c.napSpot.toLowerCase()}. ${firing(p)} cooled! My brave test tiles are practically vibrating.`,
    (_, p) => `Tail twitch! ${firing(p)} is done. I logged every degree drop in my head. Unload before I eat all the roasted clay crumbs.`,
    (c, p) => `${firing(p)} finished at fast-fire pace, ${c.loves.toLowerCase()} in action. Crack that kiln!`,
    (_, p) => `The kiln went quiet and I slid off the lid in surprise. ${firing(p)} is cooled, spicy cinnamon tea can wait. OPEN IT.`,
    (c, p) => `I was sorting ${c.collects.toLowerCase()} when ${firing(p)} finished. Kiln Fox priority: unload now.`,
    (_, p) => `${firing(p)} done. Fox ears up. Decisive glaze choices only from here. Let's see what's inside.`,
  ],
  'firing-scheduled': [
    (c, p) => `Fast-fire day! ${firing(p)} is on the schedule and I'm pacing on ${c.napSpot.toLowerCase()}.`,
    (_, p) => `${firing(p)} fires today. Line up the load while the energy's hot. I'll supervise from the lid.`,
    (c, p) => `Sipped my ${snackLead(c).toLowerCase()} and checked the calendar: ${firing(p)} is TODAY.`,
    (c, p) => `${c.loves} day. ${firing(p)} is on the plan. I already picked the bravest test tile.`,
    (_, p) => `${firing(p)} today. Prep like you mean it. I can smell heat already.`,
    (c, p) => `Temperature logs ready, tail twitching. ${firing(p)} scheduled, ${c.species} approved.`,
  ],
  'piece-drying': [
    (c, p) => `${piece(p)}, ${p.days ?? 3} days drying below ${c.napSpot.toLowerCase()}. Tap it. Move it if it rings true.`,
    (_, p) => `${p.days ?? 3} days for ${piece(p)}. Bone-dry yet? Fast-fire souls hate shelf limbo.`,
    (c, p) => `From the kiln lid I spy ${piece(p)} at ${p.days ?? 3} days. ${c.loves} don't include waiting forever.`,
    (_, p) => `${piece(p)} sat ${p.days ?? 3} days. Give it a knock, I'll judge the sound from up here.`,
    (c, p) => `${p.days ?? 3} days on ${piece(p)}. Check it before I reorganize my ${c.collects.toLowerCase()} again.`,
  ],
  'stage-overage': [
    (_, p) => `${piece(p)} stuck in ${stage(p)} ${p.days ?? 7} days? Even my test tiles are pacing. Nudge it!`,
    (c, p) => `Fox nag from ${c.napSpot.toLowerCase()}: ${piece(p)} needs to leave ${stage(p)}. ${p.days ?? 7} days is plenty.`,
    (_, p) => `${p.days ?? 7} days in ${stage(p)} for ${piece(p)}. Momentum's cold. One bold move!`,
    (c, p) => `${piece(p)} lingered in ${stage(p)}. I collect ${c.collects.toLowerCase()}. Not stalled pieces. Help.`,
    (_, p) => `*tail lash* ${piece(p)} in ${stage(p)} too long. ${p.days ?? 7} days. Break the logjam!`,
  ],
  'daily-mission': [
    (_, p) => (p.missionCount ?? 0) > 0
      ? `${p.missionCount} mission${p.missionCount === 1 ? '' : 's'} left. Knock one out before I nap on the kiln lid again.`
      : 'Missions open. Fast wins only. Pick one and RUN.',
    (c, p) => (p.missionCount ?? 0) > 0
      ? `Still ${p.missionCount} mission${p.missionCount === 1 ? '' : 's'}. ${c.loves} apply to to-do lists too.`
      : `Quick sprint? I collect ${c.collects.toLowerCase()} AND finished tasks.`,
    (_, p) => (p.missionCount ?? 0) > 0
      ? `${p.missionCount} open mission${p.missionCount === 1 ? '' : 's'}. Channel heat, not hesitation.`
      : 'Studio missions waiting. I checked the temp twice. Your move.',
    (c, p) => (p.missionCount ?? 0) > 0
      ? `${p.missionCount} mission${p.missionCount === 1 ? '' : 's'} today. Reward: roasted clay crumbs (mine, sorry).`
      : `A Kiln Fox never skips ${c.loves.toLowerCase()}. Missions are waiting.`,
  ],
  'challenge-deadline': [
    (_, p) => p.hoursLeft != null
      ? `${p.challengeTitle ?? 'Your challenge'} closes in ~${p.hoursLeft}h. Submit while it's HOT!`
      : `${p.challengeTitle ?? 'A challenge'} is almost over. Push through like a fast fire!`,
    (_, p) => p.hoursLeft != null
      ? `~${p.hoursLeft}h on ${p.challengeTitle ?? 'the challenge'}. Tail twitching. Go go go.`
      : `${p.challengeTitle ?? 'Challenge'} deadline looming. Kiln Foxes don't do slow finishes.`,
    (c, p) => p.hoursLeft != null
      ? `${p.challengeTitle ?? 'Challenge'} in ~${p.hoursLeft}h. ${snackLead(c)} courage consumed. Your turn.`
      : `${p.challengeTitle ?? 'That challenge'} wraps soon. Decisive entry energy only.`,
  ],
  achievement: [
    (c, p) => `${p.achievementName ?? 'New milestone'}! Tucking it beside my ${c.collects.toLowerCase()}.`,
    (_, p) => `YES! ${p.achievementName ?? 'A milestone'}. Fox dance on the kiln lid incoming.`,
    (c, p) => `${p.achievementName ?? 'Achievement'} earned. ${c.loves} really do pay off.`,
    (_, p) => `${p.achievementName ?? 'Badge'} unlocked. Brave studio move. This fox respects you.`,
  ],
  'weekly-summary': [
    (c, p) => `Week blaze: ${p.finishedPieces ?? 0}/${p.totalPieces ?? 0} finished. Felt every degree from ${c.napSpot.toLowerCase()}.`,
    (_, p) => `${p.finishedPieces ?? 0} of ${p.totalPieces ?? 0} done. Fast-fire energy all week. Recap time!`,
    (c, p) => `Weekly tally: ${p.finishedPieces ?? 0} crossed the line. Saved the best ${c.collects.toLowerCase()} stories.`,
    (_, p) => `${p.finishedPieces ?? 0}/${p.totalPieces ?? 0} this week. The kiln ran hot and so did you.`,
  ],
};

const TERRA: MessageBank = {
  'kiln-finished': [
    (c, p) => `*nose twitch* Poked out from ${c.napSpot.toLowerCase()}. ${firing(p)} cooled. Shelves ready for a tidy unload.`,
    (c, p) => `${firing(p)} settled nicely. I saved a kiln cookie from the last load. Remember?`,
    (_, p) => `Slow and steady: ${firing(p)} is complete. Your well-ordered shelves will thank you.`,
    (c, p) => `From the reclaim-bucket corner: ${firing(p)} done. ${c.loves} means one calm unload, not a scramble.`,
    (c, p) => `Studio Hare report from under the bench: ${firing(p)} cooled. Glaze test cards say it's time.`,
    (_, p) => `${firing(p)} finished. I thumped once for approval. Unload at your pace but do unload.`,
  ],
  'firing-scheduled': [
    (c, p) => `Well-ordered day, ${firing(p)} on the plan. I checked my ${c.collects.toLowerCase()} twice already.`,
    (c, p) => `${firing(p)} fires today. ${c.loves}. Slow rhythmic prep, then load.`,
    (c, p) => `Oat-biscuit morning: ${firing(p)} scheduled. Line the shelves, then the kiln.`,
    (_, p) => `${firing(p)} today. Studio routines exist for days like this. Trust the checklist.`,
    (c, p) => `Fresh wedged clay smell + ${firing(p)} on the calendar. ${c.species} is content.`,
    (c, p) => `${firing(p)} today. I rearranged my nap spot for a better view of the load.`,
  ],
  'piece-drying': [
    (c, p) => `${piece(p)}, ${p.days ?? 3} days drying. Gentle tap-test from ${c.napSpot.toLowerCase()}?`,
    (_, p) => `${p.days ?? 3} days on the shelf for ${piece(p)}. Slow-dry is fine. Don't lose the rhythm.`,
    (c, p) => `Wedged-clay patience: ${piece(p)} at ${p.days ?? 3} days. ${c.loves} include waiting well.`,
    (c, p) => `I collect studio routines, not dust. ${piece(p)} sat ${p.days ?? 3} days. Bone dry yet?`,
    (_, p) => `${piece(p)} at ${p.days ?? 3} days. One practical check keeps the shelf honest.`,
  ],
  'stage-overage': [
    (c, p) => `${piece(p)} in ${stage(p)} ${p.days ?? 7} days. One small nudge resets the shelf order.`,
    (_, p) => `${p.days ?? 7} days in ${stage(p)} for ${piece(p)}. Even hares notice when rhythm slips.`,
    (c, p) => `From under the bench: ${piece(p)} needs to move on from ${stage(p)}. ${c.loves} stall in ${p.days ?? 7} days.`,
    (_, p) => `${piece(p)} lingered in ${stage(p)}. Steady pass now saves a scramble later.`,
    (c, p) => `*foot thump* ${piece(p)} stuck ${p.days ?? 7} days. My ${c.collects.toLowerCase()} are neater than this.`,
  ],
  'daily-mission': [
    (_, p) => (p.missionCount ?? 0) > 0
      ? `${p.missionCount} mission${p.missionCount === 1 ? '' : 's'} remain. One practical check-in closes the gap.`
      : 'Missions waiting. A short, steady studio visit should do.',
    (c, p) => (p.missionCount ?? 0) > 0
      ? `${p.missionCount} open today. I reorganized my kiln-cookie stash; you reorganize the list.`
      : `${c.loves} applies to to-dos too. Missions are ready.`,
    (_, p) => (p.missionCount ?? 0) > 0
      ? `Still ${p.missionCount} mission${p.missionCount === 1 ? '' : 's'}. Small progress keeps the studio honest.`
      : 'Calm mission pass keeps the shelves, and the week, in order.',
    (c, p) => (p.missionCount ?? 0) > 0
      ? `${p.missionCount} mission${p.missionCount === 1 ? '' : 's'} left. Reward: fresh wedged clay smell.`
      : `Checked my ${c.collects.toLowerCase()}. Missions still open though.`,
  ],
  'challenge-deadline': [
    (_, p) => p.hoursLeft != null
      ? `${p.challengeTitle ?? 'Your challenge'} closes in ~${p.hoursLeft}h. One focused session should do.`
      : `${p.challengeTitle ?? 'A challenge'} deadline soon. Steady finish beats a rushed scramble.`,
    (c, p) => p.hoursLeft != null
      ? `~${p.hoursLeft}h on ${p.challengeTitle ?? 'the challenge'}. ${c.loves}. Plan, then push.`
      : `${p.challengeTitle ?? 'Challenge'} wrapping up. You've got a good routine. Use it.`,
    (c, p) => p.hoursLeft != null
      ? `${p.challengeTitle ?? 'Challenge'} in ~${p.hoursLeft}h. Oat biscuit, deep breath, submit.`
      : `${p.challengeTitle ?? 'That challenge'} is nearing its end. Steady hare energy.`,
  ],
  achievement: [
    (c, p) => `${p.achievementName ?? 'New milestone'} earned. Tucked beside my glaze test cards.`,
    (c, p) => `${p.achievementName ?? 'A milestone'} unlocked. ${c.loves} paid off. Quiet foot thump of pride.`,
    (_, p) => `Well earned: ${p.achievementName ?? 'achievement'}. Solid groundwork.`,
    (c, p) => `${p.achievementName ?? 'Badge'} for the shelf. Adding to my ${c.collects.toLowerCase()}.`,
  ],
  'weekly-summary': [
    (c, p) => `Week recap: ${p.finishedPieces ?? 0}/${p.totalPieces ?? 0} finished. Counted from ${c.napSpot.toLowerCase()}. Looks good.`,
    (_, p) => `${p.finishedPieces ?? 0} of ${p.totalPieces ?? 0} pieces done. The studio routine held.`,
    (c, p) => `Your wrap: ${p.finishedPieces ?? 0} crossed the line. ${c.loves} all the way down.`,
    (c, p) => `${p.finishedPieces ?? 0}/${p.totalPieces ?? 0} this week. Kiln cookies and progress. My favorite combo.`,
  ],
};

const WISP: MessageBank = {
  'kiln-finished': [
    (c, p) => `*sparkle drift* Floated down from ${c.napSpot.toLowerCase()}. ${firing(p)} might hold a glaze surprise!`,
    (c, p) => `${firing(p)} cooled! Found a forgotten glaze recipe while waiting. Peek before the magic fades?`,
    (_, p) => `Pssst. ${firing(p)} is done. Something spontaneous survived the heat, I can feel it.`,
    (c, p) => `Biscuit-crumb morning + ${firing(p)} finished = lucky day. ${c.loves} in kiln form.`,
    (c, p) => `I was cataloguing ${c.collects.toLowerCase()} when ${firing(p)} beeped. Open it. Happy accidents await!`,
    (_, p) => `${firing(p)} done! I shimmered with excitement and nearly fell off the drying shelf.`,
  ],
  'firing-scheduled': [
    (c, p) => `Surprise! ${firing(p)} is today! Found it chasing ${c.favoriteSnack.split(' and ')[1]?.toLowerCase() ?? 'morning air'}.`,
    (_, p) => `${firing(p)} on the schedule. Perfect day for a spontaneous load shuffle?`,
    (c, p) => `Oh! ${firing(p)} fires today. I collect forgotten recipes AND last-minute inspiration.`,
    (c, p) => `${c.loves} day. ${firing(p)} is today. Float through prep; something fun might happen.`,
    (_, p) => `${firing(p)} today. I hid a lucky sponge corner near the kiln for good measure.`,
    (c, p) => `Glaze Sprite bulletin: ${firing(p)} scheduled. ${c.species} recommends at least one experiment.`,
  ],
  'piece-drying': [
    (c, p) => `${piece(p)}, ${p.days ?? 3} days on ${c.napSpot.toLowerCase()}. Wander by for a tap?`,
    (_, p) => `${p.days ?? 3} days for ${piece(p)}. No rush, might be a fun surprise if it's ready.`,
    (c, p) => `Morning studio air says check ${piece(p)} (${p.days ?? 3} days). ${c.loves} start with good drying.`,
    (c, p) => `${piece(p)} sat ${p.days ?? 3} days near my ${c.collects.toLowerCase()}. Good omen?`,
    (_, p) => `${piece(p)} at ${p.days ?? 3} days. I shimmered past it, still looks interesting.`,
  ],
  'stage-overage': [
    (_, p) => `${piece(p)} floated in ${stage(p)} ${p.days ?? 7} days. Nudge when inspiration strikes?`,
    (c, p) => `${p.days ?? 7} days in ${stage(p)} for ${piece(p)}. Even sprites notice stalls, unlike my forgotten recipes.`,
    (_, p) => `${piece(p)} seems comfy in ${stage(p)}, but ${p.days ?? 7} days is a while. Peek when you drift by.`,
    (c, p) => `Forgotten on the shelf? ${piece(p)} in ${stage(p)}. I do that with ${c.collects.toLowerCase()} too, honestly.`,
    (_, p) => `*tiny sparkle* ${piece(p)} stuck ${p.days ?? 7} days. A light pass could unlock something fun.`,
  ],
  'daily-mission': [
    (_, p) => (p.missionCount ?? 0) > 0
      ? `${p.missionCount} mission${p.missionCount === 1 ? '' : 's'} open, a fun studio wander could knock one out.`
      : 'Missions floating around. Visit when the mood strikes, might be delightful.',
    (c, p) => (p.missionCount ?? 0) > 0
      ? `Just ${p.missionCount} left. I collect lucky moments, this could be one.`
      : `${c.loves} sometimes start as open missions. Peek at the list?`,
    (_, p) => (p.missionCount ?? 0) > 0
      ? `${p.missionCount} mission${p.missionCount === 1 ? '' : 's'} drifting. Spontaneous check-in?`
      : 'A light mission peek could turn into a glaze experiment. Just saying.',
    (c, p) => (p.missionCount ?? 0) > 0
      ? `${p.missionCount} mission${p.missionCount === 1 ? '' : 's'} today. Biscuit crumbs and productivity, why not?`
      : `Found a ${c.collects.toLowerCase()} AND open missions. Busy sprite day.`,
  ],
  'challenge-deadline': [
    (_, p) => p.hoursLeft != null
      ? `${p.challengeTitle ?? 'Your challenge'} closes in ~${p.hoursLeft}h, float over when inspiration hits!`
      : `${p.challengeTitle ?? 'A challenge'} almost done. Last-minute magic is my specialty.`,
    (_, p) => p.hoursLeft != null
      ? `~${p.hoursLeft}h on ${p.challengeTitle ?? 'the challenge'}. Could be a fun scramble!`
      : `${p.challengeTitle ?? 'Challenge'} deadline soon. Wander over and surprise yourself.`,
    (c, p) => p.hoursLeft != null
      ? `${p.challengeTitle ?? 'Challenge'} in ~${p.hoursLeft}h. Found an entry idea in a sponge corner.`
      : `${p.challengeTitle ?? 'That challenge'} wraps soon. ${c.loves} thrive under gentle pressure.`,
  ],
  achievement: [
    (_, p) => `Oh! ${p.achievementName ?? 'A milestone'} appeared, like a glaze recipe I forgot I saved!`,
    (c, p) => `${p.achievementName ?? 'New milestone'} unlocked! Sparkle-dance on ${c.napSpot.toLowerCase()}.`,
    (_, p) => `Look what floated in: ${p.achievementName ?? 'an achievement'}! Fun surprise.`,
    (c, p) => `${p.achievementName ?? 'Badge'} earned. Adding to my ${c.collects.toLowerCase()}, digitally, I guess.`,
  ],
  'weekly-summary': [
    (_, p) => `Week peek: ${p.finishedPieces ?? 0}/${p.totalPieces ?? 0} finished. Not bad for a sprite!`,
    (c, p) => `${p.finishedPieces ?? 0} of ${p.totalPieces ?? 0} done. Collected the sparkle moments mentally.`,
    (_, p) => `Your recap: ${p.finishedPieces ?? 0} finished. Some were happy accidents, I bet.`,
    (c, p) => `${p.finishedPieces ?? 0}/${p.totalPieces ?? 0} this week. ${c.loves} leave a trail, nice trail.`,
  ],
};

const DRIFT: MessageBank = {
  'kiln-finished': [
    (c, p) => `*long stretch* ${c.napSpot}. ${firing(p)} cooled overnight, softly.`,
    (c, p) => `${firing(p)} settled. I've been noting which ${c.loves.toLowerCase()} layers did their best work.`,
    (c, p) => `Mrrr. ${firing(p)} ready. ${snackLead(c)} steam, old kiln stories, gentle reveal when you are.`,
    (c, p) => `From beside the finished cabinet: ${firing(p)} cooled. Quiet victory stamp material, maybe.`,
    (_, p) => `${firing(p)} done. Paw taps on the floor, that's my version of applause.`,
    (c, p) => `I was updating ${c.collects.toLowerCase()} when ${firing(p)} finished. Chemistry notes can wait. Open it.`,
  ],
  'firing-scheduled': [
    (c, p) => `${firing(p)} flows onto today's schedule. ${c.loves}, thoughtful prep suits it.`,
    (_, p) => `Gently: ${firing(p)} planned for today. Layer your load like a glaze.`,
    (c, p) => `Old-kiln-story morning: ${firing(p)} fires today. No rush to the door.`,
    (c, p) => `${firing(p)} today. My ${c.collects.toLowerCase()} have a blank page ready.`,
    (c, p) => `River Cat memo from ${c.napSpot.toLowerCase()}: ${firing(p)} is today. Soft paws, steady load.`,
    (_, p) => `${firing(p)} scheduled. Chamomile steam rising, good fire day energy.`,
  ],
  'piece-drying': [
    (c, p) => `${piece(p)}, ${p.days ?? 3} days drying. ${c.loves} are my love language, check when ready.`,
    (_, p) => `${p.days ?? 3} days for ${piece(p)}. Fingers tell you if it's ready to flow onward.`,
    (c, p) => `Beside the finished cabinet, I noticed ${piece(p)} at ${p.days ?? 3} days. Soft tap?`,
    (c, p) => `${piece(p)} sat ${p.days ?? 3} days. Thoughtful glaze layers start with thoughtful drying.`,
    (_, p) => `${piece(p)} at ${p.days ?? 3} days. I wrote a note in my chemistry pad: "check soon."`,
  ],
  'stage-overage': [
    (_, p) => `${piece(p)} drifted in ${stage(p)} ${p.days ?? 7} days. Gentle nudge when hands are free.`,
    (c, p) => `${p.days ?? 7} days in ${stage(p)} for ${piece(p)}. Even river cats know when to move on.`,
    (_, p) => `${piece(p)} lingered in ${stage(p)}. Flow to it when the studio feels right.`,
    (c, p) => `Quiet note in my ${c.collects.toLowerCase()}: ${piece(p)} stuck in ${stage(p)} ${p.days ?? 7} days.`,
    (_, p) => `*soft mrrr* ${piece(p)} in ${stage(p)} too long. ${p.days ?? 7} days. Nudge, don't shove.`,
  ],
  'daily-mission': [
    (_, p) => (p.missionCount ?? 0) > 0
      ? `${p.missionCount} mission${p.missionCount === 1 ? '' : 's'} drifting on today's list.`
      : 'Studio missions await a gentle pass. The finished cabinet cheers you on.',
    (c, p) => (p.missionCount ?? 0) > 0
      ? `${p.missionCount} open mission${p.missionCount === 1 ? '' : 's'}. Visit when the studio calls.`
      : `${c.loves} include showing up. Missions are there when ready.`,
    (_, p) => (p.missionCount ?? 0) > 0
      ? `Still ${p.missionCount} today. I collect quiet victory stamps, missions count too.`
      : 'Soft mission check-in by morning light? Could be nice.',
    (c, p) => (p.missionCount ?? 0) > 0
      ? `${p.missionCount} mission${p.missionCount === 1 ? '' : 's'} left. Chamomile steam, then tackle one?`
      : `Paw tap from ${c.napSpot.toLowerCase()}: missions still open.`,
  ],
  'challenge-deadline': [
    (_, p) => p.hoursLeft != null
      ? `${p.challengeTitle ?? 'Your challenge'} drifts toward ~${p.hoursLeft}h left. Flow when ready.`
      : `${p.challengeTitle ?? 'A challenge'} nearing its end. Gentle final push?`,
    (c, p) => p.hoursLeft != null
      ? `~${p.hoursLeft}h before ${p.challengeTitle ?? 'the challenge'} closes. Old kilns met deadlines too.`
      : `${p.challengeTitle ?? 'Challenge'} closing soon. Gentle final push?`,
    (c, p) => p.hoursLeft != null
      ? `${p.challengeTitle ?? 'Challenge'} in ~${p.hoursLeft}h. Note added to my ${c.collects.toLowerCase()}.`
      : `${p.challengeTitle ?? 'That challenge'} wraps soon. Take your time but not too much.`,
  ],
  achievement: [
    (c, p) => `${p.achievementName ?? 'New milestone'}, pressing a quiet victory stamp in my notes.`,
    (_, p) => `${p.achievementName ?? 'A milestone'} drifted into your achievements. Soft celebration.`,
    (c, p) => `${p.achievementName ?? 'Achievement'} earned. ${snackLead(c)} steam and pride from the cabinet.`,
    (c, p) => `${p.achievementName ?? 'Badge'} unlocked. ${c.loves} deserve recognition.`,
  ],
  'weekly-summary': [
    (_, p) => `Week flowed to ${p.finishedPieces ?? 0}/${p.totalPieces ?? 0} finished. Quiet progress adds up.`,
    (c, p) => `${p.finishedPieces ?? 0} of ${p.totalPieces ?? 0} done. Kept glaze-layer notes on the best ones.`,
    (c, p) => `Weekly ripple: ${p.finishedPieces ?? 0}/${p.totalPieces ?? 0}. Stories from old kilns would approve.`,
    (c, p) => `${p.finishedPieces ?? 0} finished this week. ${c.collects}. You had a good run too.`,
  ],
};

const MESSAGE_BANKS: Record<string, MessageBank> = {
  ember: EMBER,
  terra: TERRA,
  wisp: WISP,
  drift: DRIFT,
};

export function buildKilnkinNotificationMessage(
  companion: KilnkinCompanion,
  kind: KilnkinVoiceEventKind,
  payload: KilnkinVoicePayload = {},
  variantSalt = 0,
): string {
  const seed = `${companion.id}:${kind}:${JSON.stringify(payload)}:${variantSalt}`;
  const bank = MESSAGE_BANKS[companion.id] ?? TERRA;
  const options = bank[kind].map((template) => template(companion, payload));
  return pickKilnkinVariant(options, seed);
}

export function countKilnkinNotificationVariants(
  companion: KilnkinCompanion,
  kind: KilnkinVoiceEventKind,
): number {
  const bank = MESSAGE_BANKS[companion.id] ?? TERRA;
  return bank[kind].length;
}

export type KilnkinStudioHintKind = 'trimming-ready' | 'reclaim-overflow' | 'kiln-ready';

const STUDIO_HINTS: Record<string, Record<KilnkinStudioHintKind, string[]>> = {
  ember: {
    'trimming-ready': [
      '*ears perk* Shelf pieces look bone-dry, I hear it from the kiln lid. Trim while the energy\'s up!',
      'A couple pieces trim-ready. My tail won\'t stop twitching until you check.',
      'Fast-fire reminder: drying shelf → trimming bench. Move move move.',
    ],
    'reclaim-overflow': [
      'Reclaim bucket overflowing. I can\'t nap on the warm kiln lid with that guilt weighing on me.',
      'Scraps piling up, quick wedging? I\'ll supervise from above with spicy cinnamon tea.',
      'Even Kiln Foxes notice a full bucket. Wedging sprint?',
    ],
    'kiln-ready': [
      'Kiln\'s calling. Brave test tiles mentally loaded, let\'s FIRE!',
      'Bone-dry pieces waiting. Temperature log starts in my head the second you load.',
      'Decisive glaze choices + bone-dry pieces = load day. I\'m pacing on the lid.',
    ],
  },
  terra: {
    'trimming-ready': [
      '*nose twitch from under the bench* Shelf pieces look trim-ready. Steady pass keeps rhythm.',
      'A couple pieces might be ready. I checked the shelf order. Your move.',
      'Studio Hare note: drying → trimming. One practical session.',
    ],
    'reclaim-overflow': [
      'Reclaim bucket full near my nap spot. Short wedging session before oat biscuits?',
      'Scraps by the work table. Even hares need clear floor space.',
      'Bucket overflow messes with my studio routines. Quick wedging?',
    ],
    'kiln-ready': [
      'Kiln feels ready. Glaze test cards reviewed, load looks orderly.',
      'Bone-dry pieces on deck. Slow rhythmic load, then fire.',
      'Checked my kiln-cookie stash AND the kiln. Both say: load day.',
    ],
  },
  wisp: {
    'trimming-ready': [
      '*sparkle* Floated past the drying shelf, trim-ready pieces spotted!',
      'Sunny corner pieces look dry. Fun trimming moment waiting?',
      'Morning studio air + bone-dry edges = maybe trim time?',
    ],
    'reclaim-overflow': [
      'Reclaim scraps gathering… found a lucky sponge corner buried in there!',
      'Bucket full on the shelf end. Tidy before the magic gets buried?',
      'Sprite alert: overflowing reclaim. Quick wedging could be oddly fun.',
    ],
    'kiln-ready': [
      'Kiln feels close! Spontaneous load day? I\'m shimmering.',
      'Bone-dry pieces waiting. I wonder what surprise the firing holds.',
      'Forgotten recipe in one pocket, kiln load in the other. Today?',
    ],
  },
  drift: {
    'trimming-ready': [
      'Morning light on the shelf, a couple pieces might be ready for trimming.',
      'Slow-dry pieces look settled. Gentle trim when hands are ready?',
      '*soft paw tap* Trimming window feels open. No rush, but open.',
    ],
    'reclaim-overflow': [
      'Reclaim bucket full by the finished cabinet. Soft wedging session?',
      'Scraps drifting up. Chamomile steam and a quick tidy?',
      'River Cat observation: bucket\'s full. Flow through a short reclaim?',
    ],
    'kiln-ready': [
      'Kiln feels ready. Thoughtful layers deserve a thoughtful load.',
      'Bone-dry pieces waiting. Old kiln stories say today\'s a good fire day.',
      'From my nap spot: load looks right. Glaze chemistry notes standing by.',
    ],
  },
};

export function getKilnkinStudioHint(
  companion: KilnkinCompanion,
  kind: KilnkinStudioHintKind,
  seed = kind,
): string {
  const hints = STUDIO_HINTS[companion.id]?.[kind] ?? STUDIO_HINTS.terra[kind];
  return pickKilnkinVariant(hints, `${companion.id}:${seed}`);
}

type StudioAlertKind = 'kiln-move' | 'planner-event' | 'seasonal-wrap' | 'piece-finished';

export function getKilnkinStudioAlertLine(
  companion: KilnkinCompanion,
  kind: StudioAlertKind,
  context: {
    pieceSummary?: string;
    eventTitle?: string;
    seasonLabel?: string;
    finishedCount?: number;
  },
): string {
  const { pieceSummary, eventTitle, seasonLabel, finishedCount } = context;
  const seed = `${companion.id}:${kind}:${JSON.stringify(context)}`;

  const lines: Record<string, Record<StudioAlertKind, string[]>> = {
    ember: {
      'kiln-move': [
        `*yip!* Studio moved ${pieceSummary ?? 'pieces to the kiln'}. Temp log starts in my head NOW.`,
        `From the kiln lid: ${pieceSummary ?? 'pieces loaded'}. Tail twitching with anticipation.`,
        `${pieceSummary ?? 'Kiln load'} happened. Brave test tiles are proud.`,
      ],
      'planner-event': [
        `${eventTitle ?? 'Something'} coming up. Marked it mentally like a test tile.`,
        `Fast-fire reminder: ${eventTitle ?? 'a studio event'} soon. No dithering.`,
        `${eventTitle ?? 'Event'} on the horizon. I already paced on the kiln lid about it.`,
      ],
      'seasonal-wrap': [
        `Your ${seasonLabel?.toLowerCase() ?? 'season'} wrap is ready. I collected the HOT moments.`,
        `${seasonLabel ?? 'Season'} recap, even foxes appreciate a good tally.`,
        `${seasonLabel ?? 'Season'} studio wrap. Roasted clay crumb celebration after you peek?`,
      ],
      'piece-finished': [
        `${finishedCount ?? 0} finished ${finishedCount === 1 ? 'piece' : 'pieces'}! Admire before the next fire.`,
        `Cabinet glowing: ${finishedCount ?? 0} done. Decisive studio energy pays off.`,
        `${finishedCount ?? 0} in the finished cabinet. Fox dance optional but encouraged.`,
      ],
    },
    terra: {
      'kiln-move': [
        `*nose twitch* From under the work table: studio moved ${pieceSummary ?? 'pieces to the kiln'}.`,
        `Orderly update, ${pieceSummary ?? 'kiln load'} happened. Shelves adjusting nicely.`,
        `${pieceSummary ?? 'Load'} in. I thumped once. Studio routine continues.`,
      ],
      'planner-event': [
        `${eventTitle ?? 'A studio event'} on the horizon. Checked the routine twice.`,
        `Planner note: ${eventTitle ?? 'something'} coming up. Steady prep.`,
        `${eventTitle ?? 'Event'} soon. Glaze test cards are ready if you need them.`,
      ],
      'seasonal-wrap': [
        `Your ${seasonLabel?.toLowerCase() ?? 'season'} wrap ready for a calm peek.`,
        `${seasonLabel ?? 'Season'} recap, kiln cookies and honest progress.`,
        `${seasonLabel ?? 'Season'} studio wrap. Slow rhythmic work, beautiful tally.`,
      ],
      'piece-finished': [
        `${finishedCount ?? 0} finished ${finishedCount === 1 ? 'piece' : 'pieces'} on the shelf. Well ordered, well earned.`,
        `Cabinet count: ${finishedCount ?? 0}. Fresh wedged clay energy for what's next?`,
        `${finishedCount ?? 0} done. I rearranged my nap spot to see them better.`,
      ],
    },
    wisp: {
      'kiln-move': [
        `Oh! Studio moved ${pieceSummary ?? 'pieces to the kiln'}, I felt the breeze!`,
        `Floated past the kiln: ${pieceSummary ?? 'a load went in'}. *sparkle*`,
        `${pieceSummary ?? 'Kiln load'}! Maybe a surprise glaze combo awaits.`,
      ],
      'planner-event': [
        `${eventTitle ?? 'Something fun'} coming up. Found it while drifting.`,
        `Calendar surprise: ${eventTitle ?? 'a studio event'} approaches.`,
        `${eventTitle ?? 'Event'} soon. I checked my forgotten-recipe stash for inspiration.`,
      ],
      'seasonal-wrap': [
        `Your ${seasonLabel?.toLowerCase() ?? 'season'} wrap drifted in. Fun to peek!`,
        `${seasonLabel ?? 'Season'} recap. Saved the sparkle moments.`,
        `${seasonLabel ?? 'Season'} wrap ready. Biscuit crumbs and nostalgia.`,
      ],
      'piece-finished': [
        `${finishedCount ?? 0} finished ${finishedCount === 1 ? 'piece' : 'pieces'}! Go admire the happy accidents.`,
        `Cabinet magic: ${finishedCount ?? 0} done. Some might surprise you.`,
        `${finishedCount ?? 0} in the cabinet. Lucky sponge corner energy up there.`,
      ],
    },
    drift: {
      'kiln-move': [
        `Mrrr. Studio moved ${pieceSummary ?? 'pieces to the kiln'}, watched from the finished cabinet.`,
        `Quiet update: ${pieceSummary ?? 'kiln load'}. Glaze layers incoming.`,
        `${pieceSummary ?? 'Load'} in. Paw taps of approval. Chemistry notes updating.`,
      ],
      'planner-event': [
        `${eventTitle ?? 'A studio event'} flows closer on the calendar.`,
        `Gentle reminder: ${eventTitle ?? 'something'} is coming up.`,
        `${eventTitle ?? 'Event'} soon. Old kiln stories say prepare softly.`,
      ],
      'seasonal-wrap': [
        `Your ${seasonLabel?.toLowerCase() ?? 'season'} wrap settled in. Morning-light reading.`,
        `${seasonLabel ?? 'Season'} recap, quiet victory stamps all around.`,
        `${seasonLabel ?? 'Season'} wrap. Chamomile steam recommended while reading.`,
      ],
      'piece-finished': [
        `${finishedCount ?? 0} finished ${finishedCount === 1 ? 'piece' : 'pieces'} beside my nap spot. Soft admiration recommended.`,
        `Cabinet glow: ${finishedCount ?? 0} done. Thoughtful glaze layers earned.`,
        `${finishedCount ?? 0} finished. I pressed a quiet victory stamp for each.`,
      ],
    },
  };

  const bank = lines[companion.id] ?? lines.terra;
  return pickKilnkinVariant(bank[kind], seed);
}

type OverviewNudgeKind =
  | 'kiln-ready'
  | 'drying-too-long'
  | 'scrap-overflow'
  | 'all-finished'
  | 'bench-clear'
  | 'one-in-flight'
  | 'many-in-flight';

export function getKilnkinOverviewNudge(
  companion: KilnkinCompanion,
  kind: OverviewNudgeKind,
  context: { count?: number; totalInFlight?: number } = {},
): string {
  const { count = 0, totalInFlight = 0 } = context;
  const seed = `${companion.id}:${kind}:${count}:${totalInFlight}`;

  const banks: Record<string, Record<OverviewNudgeKind, string[]>> = {
    ember: {
      'kiln-ready': [
        `${count} bone-dry ${count === 1 ? 'piece' : 'pieces'} ready, vibrating on the kiln lid. LOAD IT!`,
        `${count} waiting for a fast fire. Temp logs at the ready. Tail won't stop.`,
        `*yip* ${count} ${count === 1 ? 'piece' : 'pieces'} bone-dry. Decisive glaze choices start with loading.`,
      ],
      'drying-too-long': [
        'Shelf pieces sitting too long, tap-test from the kiln lid?',
        'Some pieces look patient. Bone dry yet? A Kiln Fox needs to know.',
        'Drying shelf limbo. I hate waiting almost as much as cold kilns.',
      ],
      'scrap-overflow': [
        'Reclaim bucket overflow, even foxes notice. Quick wedging?',
        'Scraps by my nap spot. Roasted-clay-crumb break after wedging?',
        'Full bucket. I slid off the kiln lid in distress. Wedging time?',
      ],
      'all-finished': [
        `${count} finished in the cabinet! Admire, then throw something BOLD.`,
        `Cabinet full (${count}). Fast-fire energy for the next piece?`,
        `${count} done. I did a little fox dance. Your turn to start fresh.`,
      ],
      'bench-clear': [
        'Clear bench. Blank slate. I LOVE a fast start.',
        'Empty bench, throw something before I fall asleep on the kiln again.',
        'Blank wheel calling. Brave test tile energy for whatever\'s next.',
      ],
      'one-in-flight': [
        'One piece in the works. Focused fire. See it through!',
        'Single piece focus. My test tiles approve of this discipline.',
        'One piece, full heat. Don\'t let momentum cool.',
      ],
      'many-in-flight': [
        `${totalInFlight} pieces moving. Keep the heat on ALL of them.`,
        `${totalInFlight} in progress, fast-fire schedule for the soul.`,
        `${totalInFlight} active. I\'m pacing on the lid watching every stage.`,
      ],
    },
    terra: {
      'kiln-ready': [
        `${count} bone-dry ${count === 1 ? 'piece' : 'pieces'} ready. Orderly load from under the work table?`,
        `${count} waiting for the kiln. Checklist time, I already started mentally.`,
        `*foot thump* ${count} ready. Studio routine says: load day.`,
      ],
      'drying-too-long': [
        'Drying shelf running long. Gentle tap-test keeps the rhythm.',
        'Some pieces sitting a while, bone dry check from the bench?',
        'Shelf patience wearing thin. Even hares have limits.',
      ],
      'scrap-overflow': [
        'Reclaim bucket full near my nap spot. Short wedging session?',
        'Scraps gathering. Oat biscuit break after a quick reclaim?',
        'Bucket overflow disrupts my studio routines. Wedging time.',
      ],
      'all-finished': [
        `${count} finished, well ordered and well earned. Start something new?`,
        `Cabinet: ${count} done. Slow rhythmic work, beautiful result.`,
        `${count} on the shelf. I saved a kiln cookie in celebration.`,
      ],
      'bench-clear': [
        'Clear bench. Fresh wedged clay energy?',
        'Blank studio bench, calm throw session would suit the day.',
        'Empty wheel. Well-ordered shelves await their next tenant.',
      ],
      'one-in-flight': [
        'One piece in the works. Steady focus. See it through.',
        'Single piece on the wheel. Studio routine says: keep going.',
        'One active piece. Slow rhythmic work, my favorite sight.',
      ],
      'many-in-flight': [
        `${totalInFlight} pieces in motion. Shelves busy, good rhythm.`,
        `${totalInFlight} moving through the studio. Orderly progress.`,
        `${totalInFlight} active. I checked glaze test cards twice, all good.`,
      ],
    },
    wisp: {
      'kiln-ready': [
        `${count} bone-dry ${count === 1 ? 'piece' : 'pieces'} on the sunny shelf end. Kiln adventure?`,
        `${count} ready to fire. Spontaneous load day? *sparkle*`,
        `${count} waiting. I found a lucky sponge corner near the kiln. Good sign?`,
      ],
      'drying-too-long': [
        'Shelf pieces sitting a while. Float by for a tap?',
        'Morning studio air says: check if those shelf pieces are ready.',
        'Drying limbo. Even sprites get curious, bone dry yet?',
      ],
      'scrap-overflow': [
        'Reclaim bucket overflowing, found a sponge corner buried in there!',
        'Scraps on the drying shelf end. Quick tidy before magic gets buried?',
        'Full bucket. I nearly lost a forgotten glaze recipe in the scraps.',
      ],
      'all-finished': [
        `${count} finished! Admire the happy accidents in the cabinet.`,
        `${count} in the cabinet, fun moment before the next experiment.`,
        `${count} done. I shimmered with pride from the sunny shelf corner.`,
      ],
      'bench-clear': [
        'Clear bench. Blank slate for something spontaneous?',
        'Empty bench, biscuit-crumb morning throw session?',
        'Blank wheel. Surprise glaze combo waiting to be discovered?',
      ],
      'one-in-flight': [
        'One piece in the works. Nice and focused, see where it goes!',
        'Single piece magic happening. I\'m floating nearby, curious.',
        'One piece, infinite possibilities. Sprite approved.',
      ],
      'many-in-flight': [
        `${totalInFlight} pieces drifting through the studio. Delightful chaos.`,
        `${totalInFlight} in progress, something fun might happen today.`,
        `${totalInFlight} active. I collect lucky moments, lot of them right now.`,
      ],
    },
    drift: {
      'kiln-ready': [
        `${count} bone-dry ${count === 1 ? 'piece' : 'pieces'} ready. Thoughtful load by morning light?`,
        `${count} waiting, glaze layers deserve a gentle fire.`,
        `*soft mrrr* ${count} ready. Old kiln stories say: good load day.`,
      ],
      'drying-too-long': [
        'Shelf pieces sitting a while. Slow-dry is fine, but check when ready.',
        'Some pieces need a soft tap. I noticed from the finished cabinet.',
        'Drying patience is my thing, but even I\'m curious now.',
      ],
      'scrap-overflow': [
        'Reclaim bucket full beside my nap spot. Soft wedging session?',
        'Scraps drifting up. Chamomile steam and a quick tidy?',
        'Full bucket by the cabinet. Flow through a gentle reclaim?',
      ],
      'all-finished': [
        `${count} finished beside the cabinet. Quiet victory stamps all around.`,
        `${count} done, admire in morning light, then start anew?`,
        `${count} on the shelf. I updated my glaze chemistry notes with joy.`,
      ],
      'bench-clear': [
        'Clear bench. Gentle throw to begin the flow?',
        'Empty bench, old kiln stories say: start something soft.',
        'Blank wheel in morning light. Thoughtful new piece energy?',
      ],
      'one-in-flight': [
        'One piece in the works. Thoughtful layers, one at a time.',
        'Single piece flowing through the studio. Nice pace.',
        'One active piece. Slow-dry day energy, my favorite.',
      ],
      'many-in-flight': [
        `${totalInFlight} pieces moving like a slow river. Beautiful.`,
        `${totalInFlight} in progress, quiet progress on many fronts.`,
        `${totalInFlight} active. Paw taps of encouragement from the cabinet.`,
      ],
    },
  };

  const bank = banks[companion.id]?.[kind] ?? banks.terra[kind];
  return pickKilnkinVariant(bank, seed);
}

/** Rewrites a plain studio note in the companion's voice, varied species mannerisms. */
export function getKilnkinVoiceLine(companion: KilnkinCompanion, message: string, seed?: string): string {
  const wrappers: Record<string, ((msg: string) => string)[]> = {
    ember: [
      (msg) => `*tail twitch* ${msg.charAt(0).toUpperCase() + msg.slice(1)}`,
      (msg) => `From atop the kiln lid: ${msg}`,
      (msg) => `*yip* ${msg.charAt(0).toUpperCase() + msg.slice(1)}`,
    ],
    terra: [
      (msg) => `*nose twitch from under the bench* ${msg.charAt(0).toUpperCase() + msg.slice(1)}`,
      (msg) => `Studio Hare note: ${msg.charAt(0).toUpperCase() + msg.slice(1)}`,
      (msg) => msg.charAt(0).toUpperCase() + msg.slice(1),
    ],
    wisp: [
      (msg) => `Pssst. ${msg.charAt(0).toLowerCase() + msg.slice(1)}`,
      (msg) => `*sparkle* ${msg.charAt(0).toUpperCase() + msg.slice(1)}`,
      (msg) => `*drift* ${msg.charAt(0).toUpperCase() + msg.slice(1)}`,
    ],
    drift: [
      (msg) => `Mrrr… ${msg.charAt(0).toLowerCase() + msg.slice(1)}`,
      (msg) => `From beside the finished cabinet: ${msg.charAt(0).toLowerCase() + msg.slice(1)}`,
      (msg) => `*soft paw tap* ${msg.charAt(0).toUpperCase() + msg.slice(1)}`,
    ],
  };

  const options = (wrappers[companion.id] ?? wrappers.terra).map((wrap) => wrap(message));
  return pickKilnkinVariant(options, seed ?? `${companion.id}:${message}`);
}

export function getKilnkinProfilePreviews(companion: KilnkinCompanion): string[] {
  return [
    buildKilnkinNotificationMessage(companion, 'kiln-finished', { firingName: 'Bisque firing' }),
    buildKilnkinNotificationMessage(companion, 'piece-drying', { pieceName: 'Morning mug', days: 4 }),
    buildKilnkinNotificationMessage(companion, 'achievement', { achievementName: 'First shelf full' }),
    buildKilnkinNotificationMessage(companion, 'weekly-summary', { finishedPieces: 3, totalPieces: 5 }),
  ];
}
