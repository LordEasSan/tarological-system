/**
 * Core — Existential Mode Diversity Engine (EMDE) + Intrinsic Divergence Architecture (IDA)
 *
 * 9 TransformationModes, each producing structurally distinct readings:
 *   DIALECTICAL — thesis → negation → tension as ground
 *   IRRUPTIVE — force erupts → aftermath → landscape altered
 *   REVELATORY — concealment exposed → function of hiding → unveiled truth
 *   INVERSIONAL — perspective inverted → normal view's blind spot → permanent double vision
 *   MYTHIC — cosmic origin story → myth's wound → cosmogonic completion
 *   ETHICAL_DIRECTIVE — imperative issued → cost of following → committed stance
 *   DEFINITIONAL — ontological definition → exclusion → definition sharpened
 *   TRAGIC_RECOGNITION — anagnorisis → grief of seeing → acceptance transforms
 *   RELATIONAL_SPECIFIC — I-Thou encounter → relational wound → living asymmetry
 *
 * Mode selection: interrogation type × card config × polarity density × hash seed.
 *
 * IDA — Intrinsic Divergence Architecture:
 *   Resolution archetype derived from (Mode × TensionType × CompletionStrategy).
 *   8 TensionTypes: polarity, hierarchy, illusion, excess, absence,
 *     sacrifice, identity_split, creation_destruction
 *   9 CompletionStrategies: integrate, sever, expose, collapse, demand,
 *     embody, limit, reverse, destabilize_further
 *   Incompatibility constraints guarantee structural divergence:
 *     same mode + different tension → different resolution
 *   No cross-reading memory. No frequency balancing.
 *
 * 7 ResolutionArchetypes:
 *   paradox_as_ground, irruptive_revelation, mythic_cosmogony,
 *   ethical_imperative, definitional_arrival, tragic_acceptance,
 *   relational_reconfiguration
 *
 * SymbolicEmbodiment: every step produces one concrete image, relational dynamic,
 * or mythic scene — no reading is purely abstract.
 *
 * HARD BANS — these phrases NEVER appear:
 *   "survives its own contradiction", "neither thesis nor negation",
 *   "carries the weight of what was denied", "cannot hold in its current form",
 *   "seen from a different angle", "the understanding widens", "deepening",
 *   "not an answer", "clarification", "open the question"
 *
 * After deterministic state is built, ONE LLM call produces embodied articulation.
 * (Deterministic fallback when no LLM available.)
 *
 * NO structural jargon. NO template repetition. NO evasive phrasing.
 */
import type {
  PlacedCard,
  SymbolicConfiguration,
  InterpretiveBiasVector,
  InterpretiveWeightVector,
  UserProfileContext,
  QuestionTargetedNarrative,
  TransformationStep,
  ExistentialState,
  TransformationMode,
  ResolutionArchetype,
  SymbolicEmbodiment,
  InterrogationMode,
  SymbolicRole,
  TarotCard,
  TensionType,
  CompletionStrategy,
} from '../../types';
import { detectQuestionMode } from './question-mode';
import { applyNarrativeVariation } from './narrative-variation';
import { validateNarrative, generateSafeFallback } from './narrative-quality-validator';

// ─── Helpers ────────────────────────────────────────

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function extractQuestionKeywords(question: string): string[] {
  const stops = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'what', 'how', 'who',
    'why', 'when', 'where', 'which', 'that', 'this', 'and', 'or', 'but',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'it',
    'its', 'my', 'your', 'our', 'can', 'do', 'does', 'did', 'has', 'have',
    'had', 'will', 'would', 'could', 'should', 'about', 'into', 'not', 'no',
    'been', 'something', 'there', 'make', 'makes',
  ]);
  return question.toLowerCase()
    .replace(/[?.,!;:'"]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stops.has(w));
}

/**
 * Extract the core noun phrase from a question for use in narrative templates.
 * Strips interrogative framing (WH-word + auxiliary) to produce a grammatically
 * natural fragment suitable for template insertion as a noun phrase.
 *
 * "what is the true friend?"         → "the true friend"
 * "how does love transform?"         → "love"
 * "what does this moment hold?"      → "this moment"
 * "what lies ahead?"                 → "what lies ahead"
 * "what is love?"                    → "love"
 * "who am I becoming?"               → "becoming"
 * "will I find love?"                → "love"
 */
export function extractQuestionCore(question: string): string {
  let q = question.toLowerCase().replace(/[?.,!;:'"]/g, '').trim();
  if (!q) return 'this';

  // Strip interrogative prefix + auxiliary verb(s) to isolate the core phrase
  const frames: RegExp[] = [
    /^(?:what|which)\s+(?:kind\s+of\s+)?(?:is|are|was|were|does|do|did|has|have|had|will|would|could|should|can)\s+/,
    /^how\s+(?:does|do|did|can|could|will|would|should|is|are)\s+/,
    /^who\s+(?:is|are|was|were|am)\s+/,
    /^why\s+(?:is|are|does|do|did|has|have|had|will|would|could|should|can)\s+/,
    /^when\s+(?:does|do|did|will|would|could|should|has|have|had)\s+/,
    /^where\s+(?:does|do|did|will|would|could|should|has|have|had)\s+/,
    /^(?:am|is|are|was|were|do|does|did|will|would|could|should|can|have|has|had)\s+(?:i|you|we|they|he|she|it|there)\s+/,
  ];

  let frameMatched = false;
  for (const f of frames) {
    const stripped = q.replace(f, '');
    if (stripped !== q) {
      q = stripped.trim();
      frameMatched = true;
      break;
    }
  }

  // If no frame matched (e.g. "what lies ahead?"), only strip "how to" / "why"
  if (!frameMatched) {
    q = q.replace(/^how\s+to\s+/, '').replace(/^(?:why|when|where)\s+/, '').trim();
  }

  // Remove trailing filler phrases
  q = q.replace(/\s+(?:for\s+me|for\s+us|for\s+you|to\s+me|about\s+me|right\s+now|anymore)$/, '').trim();

  // Strip leading pronouns ("i becoming" → "becoming")
  q = q.replace(/^(?:i|me|we|us)\s+/, '').trim();

  // Truncate at verb boundaries to extract the noun-phrase core
  const words = q.split(/\s+/);
  const VERBS = new Set([
    'transform', 'change', 'become', 'becoming', 'emerge', 'happen',
    'unfold', 'affect', 'mean', 'means', 'hold', 'move', 'evolve',
    'manifest', 'look', 'feel', 'think', 'go', 'come', 'inhabit',
    'live', 'work', 'take', 'give', 'surround', 'bring', 'exist',
    'reveal', 'hide', 'define', 'require', 'need', 'want', 'await',
    'find', 'see', 'know', 'learn', 'teach', 'show', 'tell',
    'lies', 'stands', 'keeps', 'makes', 'says', 'ask', 'asks',
    'lead', 'leads', 'hurt', 'hurts', 'heal', 'heals', 'break',
    'create', 'destroy', 'open', 'close', 'remain', 'stay', 'leave',
  ]);
  const WH_WORDS = new Set(['what', 'how', 'who', 'why', 'when', 'where', 'which']);
  const TRAILING = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from']);

  // Skip leading verb: "find love" → "love"
  if (words.length > 1 && VERBS.has(words[0])) {
    words.splice(0, 1);
    q = words.join(' ');
  }

  // Cut at interior verb: "this moment hold" → "this moment"
  if (words.length > 1) {
    const verbIdx = words.findIndex((w, i) => i > 0 && VERBS.has(w));
    if (verbIdx > 0) {
      let end = verbIdx;
      while (end > 1 && TRAILING.has(words[end - 1])) end--;
      // Don't truncate if it would leave only a WH-word
      if (end > 1 || !WH_WORDS.has(words[0])) {
        q = words.slice(0, end).join(' ');
      }
    }
  }

  // Safety cap at 6 words
  const finalWords = q.split(/\s+/);
  if (finalWords.length > 6) {
    q = finalWords.slice(0, 6).join(' ');
  }

  return q.trim() || 'this';
}

// ─── Banned Phrases ─────────────────────────────────

const BANNED_PHRASES = [
  'survives its own contradiction',
  'neither thesis nor negation',
  'carries the weight of what was denied',
  'cannot hold in its current form',
  'seen from a different angle',
  'the understanding widens',
  'deepening',
  'not an answer',
  'clarification',
  'open the question',
  'opens possibilities',
  'open it further',
  'revealing dimensions',
  'not yet the answer',
  'what survives when both are held',
  'what remains when both',
];

function sanitize(text: string): string {
  let result = text;
  for (const phrase of BANNED_PHRASES) {
    const re = new RegExp(phrase, 'gi');
    result = result.replace(re, '');
  }
  return result.replace(/\s{2,}/g, ' ').trim();
}

// ─── Archetypal Existential Essences ────────────────

interface ArchetypalEssence {
  force: string;
  shadow: string;
  definition: string;
  relational: string;
  cosmic: string;
  paradox: string;
}

const ESSENCES: Record<string, ArchetypalEssence> = {
  'The Fool': {
    force: 'pure beginning before knowledge',
    shadow: 'reckless dissolution of what matters',
    definition: 'existence precedes essence — you are real before you know what you are',
    relational: 'the other is met before reputation, before history, at the zero point',
    cosmic: 'before there was order, there was the leap — creation as risk, not design',
    paradox: 'to begin truly, you must be willing to be nothing',
  },
  'The Magician': {
    force: 'will as the origin of the real',
    shadow: 'manipulation that replaces truth with intention',
    definition: 'what is real is what has been willed into being through focused attention',
    relational: 'the other becomes real when you direct your full presence toward them',
    cosmic: 'the first conscious force that shapes chaos into form — logos emerging from void',
    paradox: 'the power to create is also the power to deceive',
  },
  'The High Priestess': {
    force: 'the unknowable interior that precedes speech',
    shadow: 'withdrawal into silence that refuses all connection',
    definition: 'what is most real cannot be spoken — it can only be witnessed in stillness',
    relational: 'the deepest bond is the one that endures silence, not the one that fears it',
    cosmic: 'the void that precedes creation is not empty — it is pregnant with all possibility',
    paradox: 'to know the deepest truth, you must stop seeking it',
  },
  'The Empress': {
    force: 'generative abundance that creates without needing reason',
    shadow: 'suffocating nurture that binds through dependency',
    definition: 'being is overflow — what is real generates more of itself without effort',
    relational: 'love is not scarcity but fertility — it multiplies when given, not spent',
    cosmic: 'the cosmos creates not from plan but from excess — being spills into being',
    paradox: 'abundance can become the prison of those who receive without limit',
  },
  'The Emperor': {
    force: 'ordering force that makes the chaotic endure',
    shadow: 'rigidity that mistakes control for safety',
    definition: 'what endures is what has been given structure — form is the condition of meaning',
    relational: 'the bond that lasts is the one with clear boundaries, not the one without limits',
    cosmic: 'after the overflow there must be law — without structure, creation consumes itself',
    paradox: 'the one who orders the world becomes a prisoner of their own architecture',
  },
  'The Hierophant': {
    force: 'inherited meaning that precedes individual understanding',
    shadow: 'dogma that replaces living encounter with dead repetition',
    definition: 'before you, there was already a world with answers — meaning is received before it is made',
    relational: 'the other carries a tradition you did not choose but cannot escape',
    cosmic: 'the cosmos has a grammar older than any speaker — to exist is to be spoken by a language that precedes you',
    paradox: 'the tradition that gives you ground is the same one that prevents you from standing on your own',
  },
  'The Lovers': {
    force: 'the choice that creates identity through desire',
    shadow: 'inability to choose that dissolves the self into indecision',
    definition: 'you become who you are through what you desire — identity is born in the act of choosing',
    relational: 'the other is not found but chosen — and in choosing, you create both yourself and them',
    cosmic: 'the cosmos differentiates through attraction — without desire, there is only undifferentiated void',
    paradox: 'every choice for something is a destruction of everything else you might have been',
  },
  'The Chariot': {
    force: 'directed will that moves through opposition',
    shadow: 'aggression that mistakes momentum for purpose',
    definition: 'to exist is to move — stasis is the refusal of being, not its preservation',
    relational: 'the other is honoured when you move toward them with purpose, not when you wait',
    cosmic: 'the cosmos is not balanced — it is driven, and order is the trace of irreversible movement',
    paradox: 'the one who moves with total conviction has no eyes for what they leave behind',
  },
  'Strength': {
    force: 'patient force that endures without imposing',
    shadow: 'self-doubt disguised as gentleness',
    definition: 'true power does not impose — it waits, and in waiting, transforms what it touches',
    relational: 'the strongest bond is the one that does not need to prove itself',
    cosmic: 'the force that holds the cosmos together is not violence but patient gravity',
    paradox: 'to be truly strong is to appear weak to those who understand only force',
  },
  'The Hermit': {
    force: 'solitary truth found only in withdrawal',
    shadow: 'isolation mistaken for wisdom',
    definition: 'some knowledge is available only to those who have left the crowd — solitude is a method',
    relational: 'the one who withdraws carries a lantern — they return not empty but luminous',
    cosmic: 'consciousness itself is a withdrawal from the world into the interior — the cosmos knows itself only in solitude',
    paradox: 'the one who seeks truth alone may have already lost the world where truth operates',
  },
  'Wheel of Fortune': {
    force: 'fate as the pattern that repeats whether you see it or not',
    shadow: 'helplessness before the impersonal turning of events',
    definition: 'what is real is the pattern, not the moment — you are not the event but the cycle',
    relational: 'the other is not accidental — your meeting is inscribed in a pattern larger than either of you',
    cosmic: 'the cosmos moves in cycles, and what appears as chance is the turning visible from below',
    paradox: 'to see the wheel is to realize you cannot stop it — freedom is where you stand as it turns',
  },
  'Justice': {
    force: 'consequential being — every act inscribes itself into reality',
    shadow: 'merciless judgment that denies the possibility of mercy',
    definition: 'what is real is what has consequences — an act without aftermath was never truly an act',
    relational: 'the other demands fairness, and in that demand, reveals that relationship requires accountability',
    cosmic: 'the cosmos is not indifferent — it answers, and the answer is proportional to the question',
    paradox: 'perfect justice would destroy mercy, and without mercy, justice becomes punishment without end',
  },
  'The Hanged Man': {
    force: 'inverted perspective that sees through surrender',
    shadow: 'paralysis mistaken for patience',
    definition: 'what you see standing upright is not the whole — inversion reveals what comfort conceals',
    relational: 'the one who surrenders in the presence of another discovers what coercion could never reach',
    cosmic: 'the cosmos is legible only to those willing to be suspended — gravity is not the only truth',
    paradox: 'to act, you must first stop acting — the deepest movement begins in stillness',
  },
  'Death': {
    force: 'necessary ending that makes new life possible',
    shadow: 'refusal to end what must die, prolonging what is already dead',
    definition: 'what does not die becomes a prison — endings are the condition of authentic existence',
    relational: 'the bond must be able to die and be reborn, or it becomes a monument to what no longer lives',
    cosmic: 'the cosmos creates by destroying — every birth is a death, every death a clearing',
    paradox: 'to love something truly is to accept that it will end — and its ending is part of what made it real',
  },
  'Temperance': {
    force: 'dynamic integration of what appears incompatible',
    shadow: 'forced moderation that suppresses genuine intensity',
    definition: 'opposites do not resolve — they learn to move together without destroying each other',
    relational: 'the deepest bond is not agreement but the capacity to hold difference without rupture',
    cosmic: 'the cosmos is not monotone — it is the sustained coexistence of forces that should destroy each other but do not',
    paradox: 'to integrate everything is to risk caring about nothing with full intensity',
  },
  'The Devil': {
    force: 'the bond to materiality that reveals what you truly value',
    shadow: 'bondage you call freedom because you have forgotten what freedom costs',
    definition: 'freedom is impossible while you deny what binds you — the chain is only visible from outside it',
    relational: 'the other becomes a mirror of your attachment — you love what you cannot release',
    cosmic: 'matter is not the enemy of spirit — it is the weight that gives spirit substance',
    paradox: 'what binds you is also what gives you substance — to be completely free is to be nothing at all',
  },
  'The Tower': {
    force: 'catastrophic revelation that destroys what was built on lies',
    shadow: 'the terror of seeing clearly after years of chosen blindness',
    definition: 'what is built on a lie must fall — the collapse is not punishment but architecture becoming honest',
    relational: 'some bonds endure destruction because they were true; the ones that fall were already empty',
    cosmic: 'the cosmos periodically annihilates its own forms — not from malice but from the impossibility of sustaining falsity',
    paradox: 'the most creative act is destruction — what rises from ruin was waiting beneath all along',
  },
  'The Star': {
    force: 'radical hope after destruction — the minimum necessary for beginning again',
    shadow: 'naive optimism that refuses to grieve what was lost',
    definition: 'after everything falls, what endures is exactly enough — hope is not fantasy but the residue of truth',
    relational: 'the other who stays after the collapse is the one who was real all along',
    cosmic: 'the cosmos, after every annihilation, leaves a seed — creation is the stubbornness of being',
    paradox: 'hope is only genuine when it has outlived the loss of everything that justified it',
  },
  'The Moon': {
    force: 'the depth of the unconscious where meaning has not yet become language',
    shadow: 'fear that distorts perception until illusion becomes indistinguishable from reality',
    definition: 'what frightens you carries the meaning you refuse to claim — the shadow holds what the conscious rejects',
    relational: 'the other becomes unknowable at night — and it is in this unknowing that real recognition occurs',
    cosmic: 'beneath the visible cosmos is another, and it speaks in images, not in words',
    paradox: 'to see clearly, you must first let yourself be confused — certainty is the enemy of depth',
  },
  'The Sun': {
    force: 'manifest joy that needs no justification',
    shadow: 'forced positivity that denies the existence of darkness',
    definition: 'being, when it is authentic, is luminous — what is real does not need permission to shine',
    relational: 'the other, when truly met, transforms the encounter into something radiant and unashamed',
    cosmic: 'the cosmos, at its core, is not indifferent — it is radiant, and consciousness is its way of celebrating',
    paradox: 'joy that denies sadness becomes a mask — the full spectrum is required, not just the light',
  },
  'Judgement': {
    force: 'the reckoning — confrontation with what you could have become',
    shadow: 'refusal to examine yourself because the verdict might be unbearable',
    definition: 'you are called to account not by others but by the version of yourself you abandoned',
    relational: 'the other calls you into your fullness — their gaze is a mirror of what you owe yourself',
    cosmic: 'the cosmos demands that what was unconscious become conscious — not as punishment but as completion',
    paradox: 'the judgement you fear most is the one you have already passed on yourself — and avoided hearing',
  },
  'The World': {
    force: 'wholeness achieved — the journey completes itself',
    shadow: 'the stagnation of completion that refuses to begin again',
    definition: 'the journey ends not when you arrive but when you recognize where you have always been',
    relational: 'the other is not separate — they are the missing face of a wholeness you could not see alone',
    cosmic: 'the cosmos is already whole — what we call seeking is the whole learning to see itself',
    paradox: 'completion is also an ending — and every ending is the threshold of a beginning you did not ask for',
  },
};

// ─── Embodiment Bank ────────────────────────────────

interface CardEmbodiments {
  concrete: string;
  relational: string;
  mythic: string;
}

const EMBODIMENT_BANK: Record<string, CardEmbodiments> = {
  'The Fool': {
    concrete: 'A figure at the cliff edge, bag over shoulder, the void below indistinguishable from sky',
    relational: 'Two people meeting for the first time with no past between them — both possible, both fragile',
    mythic: 'Before the first word, before the first division — the cosmos steps off its own edge',
  },
  'The Magician': {
    concrete: 'A hand reaches through four elements on a table — air, fire, water, earth — and chooses',
    relational: 'One who shapes the other through focused attention alone — presence as creative force',
    mythic: 'The first conscious act divides chaos into form — logos speaks and the formless obeys',
  },
  'The High Priestess': {
    concrete: 'A veil between two pillars — behind it, everything you know but cannot say',
    relational: 'The silence between two people that holds more than their words ever could',
    mythic: 'The void before creation is not empty — it is the unspoken pregnant with all that will ever be said',
  },
  'The Empress': {
    concrete: 'A field in full bloom with no gardener — abundance without effort, fertility without intention',
    relational: 'Love that overflows, that gives without counting — and the danger of drowning in what is given',
    mythic: 'The cosmos spills being into being — creation is not an act but an overflow that cannot stop itself',
  },
  'The Emperor': {
    concrete: 'A throne carved from stone, a scepter held so long it has fused to the hand that holds it',
    relational: 'The one who sets boundaries discovers they now live inside a cage of their own architecture',
    mythic: 'After the overflow, law descends — without structure, creation devours itself whole',
  },
  'The Hierophant': {
    concrete: 'An ancient book open to a page no one living has questioned — answers older than the seeker',
    relational: 'The teacher who gives you the world\'s grammar may mistake it for the world itself',
    mythic: 'A language older than any speaker — you were spoken before you learned to speak',
  },
  'The Lovers': {
    concrete: 'Two faces turning toward each other and away in the same breath — desire as the birth of selfhood',
    relational: 'Choosing the other creates both — the one chosen and the one choosing become real together',
    mythic: 'The cosmos differentiates through attraction — without the first desire, only undifferentiated void remains',
  },
  'The Chariot': {
    concrete: 'Two horses pulling in opposite directions, held by a will that has forgotten how to rest',
    relational: 'The one who moves toward you with full force may not see what their momentum destroys',
    mythic: 'The cosmos is not balanced but driven — what we call order is the scar of irreversible motion',
  },
  'Strength': {
    concrete: 'A hand resting on a lion\'s jaw — not gripping, not releasing — just resting there',
    relational: 'The bond that does not need to prove itself — strength measured by what it chooses not to use',
    mythic: 'The cosmos holds itself through patient gravity, not through force — endurance as cosmic principle',
  },
  'The Hermit': {
    concrete: 'A lantern held high on a mountain no one else has climbed — solitude as method, not exile',
    relational: 'The one who returns from withdrawal carries light — their absence was preparation for encounter',
    mythic: 'Consciousness withdraws from the world to see it — the cosmos knows itself only in solitude',
  },
  'Wheel of Fortune': {
    concrete: 'Figures rising and falling on a wheel no hand turns — what lifts you up will bring you down',
    relational: 'Your meeting was not accidental — it is inscribed in a pattern larger than either of you',
    mythic: 'The cosmos turns in cycles — what appears as chance is the eternal turning visible from below',
  },
  'Justice': {
    concrete: 'Scales that measure not weight but consequence — nothing escapes the ledger of what has been done',
    relational: 'The other demands fairness, and in that demand reveals that love without accountability is fiction',
    mythic: 'The cosmos answers every act in proportion — even silence is a verdict',
  },
  'The Hanged Man': {
    concrete: 'A figure suspended by one foot, seeing the world inverted — what comfort concealed, surrender reveals',
    relational: 'The one who surrenders discovers what coercion never could — what the other truly requires',
    mythic: 'Gravity is not the only truth — the cosmos suspends its laws for those willing to be suspended',
  },
  'Death': {
    concrete: 'A skeleton on a white horse, fields of the harvested and the sown — what dies nourishes what comes',
    relational: 'The bond that dies and is not mourned becomes a monument to what no longer breathes',
    mythic: 'The cosmos creates by destroying — every genesis is a funeral, every clearing an invitation',
  },
  'Temperance': {
    concrete: 'Water poured between two cups, never spilling, never stopping — movement as balance, not stasis',
    relational: 'Two people learning to hold their differences without rupture — unity as sustained tension',
    mythic: 'The cosmos is the sustained coexistence of forces that should destroy each other — but do not',
  },
  'The Devil': {
    concrete: 'Chains loose enough to remove, worn anyway — bondage chosen because freedom costs more than servitude',
    relational: 'The other becomes a mirror of your attachment — you love not them but the need for them',
    mythic: 'Matter is not the enemy of spirit — it is the weight that gives spirit something to push against',
  },
  'The Tower': {
    concrete: 'A building struck by lightning from a clear sky — a foundation of lies meeting the clarity of fire',
    relational: 'The bond that endures destruction was true; the one that falls was already hollow inside',
    mythic: 'The cosmos shatters its own forms periodically — not from malice but from the impossibility of sustaining lies',
  },
  'The Star': {
    concrete: 'A figure kneeling by a pool, pouring water onto land and into water — after ruin, exactly enough endures',
    relational: 'The person who stays after the collapse is the one who was real before the walls went up',
    mythic: 'After every annihilation, the cosmos leaves a seed — creation is the stubbornness of being',
  },
  'The Moon': {
    concrete: 'Two towers, a path between them, creatures rising from water — what the daylight mind calls fear the night mind calls truth',
    relational: 'The other is unknowable at night — and in that unknowing, real recognition becomes possible',
    mythic: 'Beneath the visible cosmos is another that speaks in images, not in words — dreams as ontology',
  },
  'The Sun': {
    concrete: 'A child on a white horse under a radiant sun — joy so genuine it requires no justification',
    relational: 'When two people truly meet, the encounter becomes radiant and unashamed — light without performance',
    mythic: 'At its core, the cosmos is luminous — consciousness is its way of celebrating its own existence',
  },
  'Judgement': {
    concrete: 'Figures rising from coffins at the sound of a trumpet — called to account by the self you left behind',
    relational: 'The other calls you into fullness — their gaze is a mirror of what you owe to yourself',
    mythic: 'The cosmos demands that what was unconscious become conscious — not as punishment but as completion',
  },
  'The World': {
    concrete: 'A dancer inside a wreath of laurel — the journey ends at the recognition that you were always here',
    relational: 'The other is not separate — they are the missing face of a wholeness invisible alone',
    mythic: 'The cosmos is already whole — what we call seeking is the whole learning to see itself through us',
  },
};

// ─── Question Domain Classification ─────────────────

type QuestionDomain = 'relational' | 'ontological' | 'cosmological' | 'ethical' | 'existential';

function classifyQuestionDomain(question: string): QuestionDomain {
  const q = question.toLowerCase();
  if (/who|friend|enemy|love|bond|relationship|trust|betray/.test(q)) return 'relational';
  if (/what (is|are|makes)|nature of|real|exist|being|essence/.test(q)) return 'ontological';
  if (/universe|cosmos|born|creation|origin|world|everything/.test(q)) return 'cosmological';
  if (/should|right|wrong|good|evil|moral|duty|ought/.test(q)) return 'ethical';
  return 'existential';
}

// ─── Mode Selection Algorithm ───────────────────────

const ALL_MODES: TransformationMode[] = [
  'dialectical', 'irruptive', 'revelatory', 'inversional', 'mythic',
  'ethical_directive', 'definitional', 'tragic_recognition', 'relational_specific',
];

function selectTransformationMode(
  questionDomain: QuestionDomain,
  interrogationMode: InterrogationMode,
  cardNames: string[],
  roles: SymbolicRole[],
  reversedCount: number,
  totalCards: number,
  question: string,
): TransformationMode {
  const w: Record<TransformationMode, number> = {
    dialectical: 1,
    irruptive: 1,
    revelatory: 1,
    inversional: 1,
    mythic: 1,
    ethical_directive: 1,
    definitional: 1,
    tragic_recognition: 1,
    relational_specific: 1,
  };

  // Interrogation mode adjustments
  if (interrogationMode === 'cosmological') {
    w.mythic += 4;
    w.revelatory += 3;
    w.definitional += 1;
    w.relational_specific = 0.3;
    w.ethical_directive = 0.5;
  } else if (interrogationMode === 'divinatory') {
    w.irruptive += 2;
    w.tragic_recognition += 2;
    w.revelatory += 1;
    w.inversional += 1;
  }

  // Question domain adjustments
  if (questionDomain === 'relational') {
    w.relational_specific += 4;
    w.tragic_recognition += 2;
    w.inversional += 1;
  } else if (questionDomain === 'ethical') {
    w.ethical_directive += 4;
    w.tragic_recognition += 2;
    w.dialectical += 1;
  } else if (questionDomain === 'ontological') {
    w.definitional += 3;
    w.dialectical += 2;
    w.revelatory += 2;
  } else if (questionDomain === 'cosmological') {
    w.mythic += 4;
    w.revelatory += 3;
  }

  // Polarity density adjustments
  const polarityDensity = reversedCount / Math.max(totalCards, 1);
  if (polarityDensity > 0.5) {
    w.dialectical += 2;
    w.tragic_recognition += 2;
    w.inversional += 2;
  } else if (polarityDensity === 0) {
    w.definitional += 2;
    w.revelatory += 2;
    w.mythic += 1;
  }

  // Card-specific boosts
  for (const name of cardNames) {
    if (name === 'The Hanged Man') w.inversional += 2;
    if (name === 'Death' || name === 'The Tower') w.irruptive += 2;
    if (name === 'The Fool' || name === 'The World') w.mythic += 2;
    if (name === 'The Hermit' || name === 'The High Priestess') w.revelatory += 2;
    if (name === 'The Lovers') w.relational_specific += 2;
    if (name === 'Justice') w.ethical_directive += 2;
    if (name === 'Judgement') w.tragic_recognition += 2;
    if (name === 'The Moon') w.revelatory += 1;
    if (name === 'The Star') w.mythic += 1;
    if (name === 'The Devil') w.dialectical += 1;
    if (name === 'The Emperor') w.definitional += 1;
    if (name === 'The Sun') w.revelatory += 1;
  }

  // Role adjustments
  if (roles.includes('shadow')) {
    w.tragic_recognition += 1;
    w.dialectical += 1;
  }
  if (roles.includes('bridge')) {
    w.relational_specific += 1;
    w.definitional += 1;
  }

  // Weighted selection via hash
  const totalWeight = ALL_MODES.reduce((sum, m) => sum + Math.max(w[m], 0), 0);
  const seedVal = hash(question + cardNames.join(','));
  const target = (seedVal % 1000) / 1000 * totalWeight;

  let cumulative = 0;
  for (const mode of ALL_MODES) {
    cumulative += Math.max(w[mode], 0);
    if (cumulative >= target) return mode;
  }
  return 'definitional';
}

// ─── Tension Completion Engine (TCE) ────────────────

const ALL_TENSION_TYPES: TensionType[] = [
  'polarity', 'hierarchy', 'illusion', 'excess',
  'absence', 'sacrifice', 'identity_split', 'creation_destruction',
];

const ALL_COMPLETION_STRATEGIES: CompletionStrategy[] = [
  'integrate', 'sever', 'expose', 'collapse',
  'demand', 'embody', 'limit', 'reverse', 'destabilize_further',
];

/**
 * Classify the tension type from the final existential state.
 * No cross-reading memory — purely structural from this reading.
 */
function classifyTensionType(
  finalState: ExistentialState,
  mode: TransformationMode,
  roles: SymbolicRole[],
  question: string,
): TensionType {
  const axis = (finalState.tensionAxis ?? '').toLowerCase();
  const thesis = (finalState.currentThesis ?? '').toLowerCase();
  const polarity = finalState.unresolvedPolarity;
  const direction = (finalState.ontologicalDirection ?? '').toLowerCase();

  // Build a weight map
  const w: Record<TensionType, number> = {
    polarity: 0, hierarchy: 0, illusion: 0, excess: 0,
    absence: 0, sacrifice: 0, identity_split: 0, creation_destruction: 0,
  };

  // Axis analysis — keywords in the tension axis
  if (axis.includes('↔')) w.polarity += 3;
  if (polarity) w.polarity += 2;

  // Direction keywords
  if (direction.includes('descent') || direction.includes('denied')) w.absence += 2;
  if (direction.includes('grounding') || direction.includes('stable')) w.hierarchy += 2;
  if (direction.includes('transformative') || direction.includes('opposition')) w.creation_destruction += 2;
  if (direction.includes('integration') || direction.includes('irreconcilable')) w.identity_split += 2;

  // Thesis keywords
  if (thesis.includes('tension between') || thesis.includes('inverted')) w.polarity += 1;
  if (thesis.includes('aftermath') || thesis.includes('eruption') || thesis.includes('force')) w.excess += 2;
  if (thesis.includes('unveiled') || thesis.includes('concealed') || thesis.includes('hidden')) w.illusion += 3;
  if (thesis.includes('recognition') || thesis.includes('grief') || thesis.includes('tragic')) w.sacrifice += 2;
  if (thesis.includes('encounter') || thesis.includes('relation')) w.identity_split += 1;
  if (thesis.includes('imperative') || thesis.includes('demand') || thesis.includes('directive')) w.hierarchy += 1;
  if (thesis.includes('definition') || thesis.includes('defines')) w.hierarchy += 1;
  if (thesis.includes('cosmic') || thesis.includes('myth') || thesis.includes('creation')) w.creation_destruction += 2;

  // Mode-based biases (secondary — tension primarily comes from state)
  switch (mode) {
    case 'dialectical': w.polarity += 1; w.identity_split += 1; break;
    case 'irruptive': w.excess += 1; w.creation_destruction += 1; break;
    case 'revelatory': w.illusion += 1; w.absence += 1; break;
    case 'inversional': w.polarity += 1; w.illusion += 1; break;
    case 'mythic': w.creation_destruction += 1; w.sacrifice += 1; break;
    case 'ethical_directive': w.hierarchy += 1; w.sacrifice += 1; break;
    case 'definitional': w.hierarchy += 1; w.absence += 1; break;
    case 'tragic_recognition': w.sacrifice += 2; break;
    case 'relational_specific': w.identity_split += 1; w.polarity += 1; break;
  }

  // Role-based adjustments
  if (roles.includes('shadow')) { w.absence += 1; w.sacrifice += 1; }
  if (roles.includes('catalyst')) { w.excess += 1; w.creation_destruction += 1; }
  if (roles.includes('bridge')) { w.identity_split += 1; }
  if (roles.includes('anchor')) { w.hierarchy += 1; }

  // Question keyword adjustments
  const qLow = question.toLowerCase();
  if (qLow.includes('sacrifice') || qLow.includes('loss') || qLow.includes('give up')) w.sacrifice += 2;
  if (qLow.includes('power') || qLow.includes('control') || qLow.includes('authority')) w.hierarchy += 2;
  if (qLow.includes('truth') || qLow.includes('illusion') || qLow.includes('real')) w.illusion += 2;
  if (qLow.includes('too much') || qLow.includes('overwhelm') || qLow.includes('excess')) w.excess += 2;
  if (qLow.includes('missing') || qLow.includes('lack') || qLow.includes('empty')) w.absence += 2;
  if (qLow.includes('who am i') || qLow.includes('identity') || qLow.includes('self')) w.identity_split += 2;
  if (qLow.includes('create') || qLow.includes('destroy') || qLow.includes('transform')) w.creation_destruction += 2;

  // Hash-weighted selection for diversity
  const seed = hash(question + axis + mode);
  const totalWeight = ALL_TENSION_TYPES.reduce((sum, t) => sum + Math.max(w[t], 1), 0);
  const target = (seed % 1000) / 1000 * totalWeight;

  let cumulative = 0;
  for (const tt of ALL_TENSION_TYPES) {
    cumulative += Math.max(w[tt], 1);
    if (cumulative >= target) return tt;
  }
  return 'polarity';
}

/**
 * Incompatibility constraints — certain (tension, strategy) pairs are forbidden.
 */
const INCOMPATIBLE_PAIRS: Array<[TensionType, CompletionStrategy]> = [
  ['polarity', 'integrate'],
  ['hierarchy', 'limit'],
  ['absence', 'collapse'],
  ['creation_destruction', 'embody'],
  ['illusion', 'integrate'],
  ['excess', 'destabilize_further'],
  ['sacrifice', 'reverse'],
  ['identity_split', 'sever'],
];

/**
 * Select a completion strategy given mode, tension, and incompatibility constraints.
 * No cross-reading memory — purely structural.
 */
function selectCompletionStrategy(
  tensionType: TensionType,
  mode: TransformationMode,
  finalState: ExistentialState,
  question: string,
): CompletionStrategy {
  // Build viable strategies (exclude incompatible ones)
  const blocked = new Set(
    INCOMPATIBLE_PAIRS
      .filter(([t]) => t === tensionType)
      .map(([, s]) => s),
  );

  const viable = ALL_COMPLETION_STRATEGIES.filter(s => !blocked.has(s));

  // Weight the viable strategies by mode + tension affinity
  const w: Record<CompletionStrategy, number> = {
    integrate: 0, sever: 0, expose: 0, collapse: 0,
    demand: 0, embody: 0, limit: 0, reverse: 0, destabilize_further: 0,
  };

  // Tension-based affinities
  switch (tensionType) {
    case 'polarity': w.reverse += 3; w.embody += 2; w.collapse += 1; break;
    case 'hierarchy': w.collapse += 3; w.sever += 2; w.demand += 1; break;
    case 'illusion': w.expose += 4; w.sever += 1; w.collapse += 1; break;
    case 'excess': w.limit += 3; w.sever += 2; w.collapse += 1; break;
    case 'absence': w.demand += 3; w.embody += 2; w.integrate += 1; break;
    case 'sacrifice': w.embody += 3; w.demand += 2; w.integrate += 1; break;
    case 'identity_split': w.integrate += 3; w.expose += 2; w.embody += 1; break;
    case 'creation_destruction': w.reverse += 3; w.collapse += 2; w.destabilize_further += 2; break;
  }

  // Mode-based secondary boosts
  switch (mode) {
    case 'dialectical': w.reverse += 1; w.destabilize_further += 1; break;
    case 'irruptive': w.collapse += 1; w.sever += 1; break;
    case 'revelatory': w.expose += 2; break;
    case 'inversional': w.reverse += 2; break;
    case 'mythic': w.embody += 1; w.integrate += 1; break;
    case 'ethical_directive': w.demand += 2; break;
    case 'definitional': w.limit += 1; w.expose += 1; break;
    case 'tragic_recognition': w.embody += 1; w.demand += 1; break;
    case 'relational_specific': w.integrate += 1; w.embody += 1; break;
  }

  // Hash-weighted selection among viable strategies
  const seed = hash(question + tensionType + mode + (finalState.tensionAxis ?? ''));
  const totalWeight = viable.reduce((sum, s) => sum + Math.max(w[s], 1), 0);
  const target = (seed % 1000) / 1000 * totalWeight;

  let cumulative = 0;
  for (const s of viable) {
    cumulative += Math.max(w[s], 1);
    if (cumulative >= target) return s;
  }
  return viable[0];
}

/**
 * Resolution archetype constraints — certain (tension, archetype) pairs are forbidden.
 */
const ARCHETYPE_INCOMPATIBLE: Array<[TensionType, ResolutionArchetype]> = [
  ['creation_destruction', 'mythic_cosmogony'],
  ['hierarchy', 'definitional_arrival'],
  ['absence', 'paradox_as_ground'],
  ['polarity', 'definitional_arrival'],
  ['illusion', 'ethical_imperative'],
  ['excess', 'relational_reconfiguration'],
];

/**
 * Derive resolution archetype from the triple (mode, tensionType, completionStrategy).
 * This replaces the old MODE_ARCHETYPE_MAP direct mapping.
 */
function deriveResolutionArchetype(
  mode: TransformationMode,
  tensionType: TensionType,
  completionStrategy: CompletionStrategy,
  interrogationMode: InterrogationMode,
  question: string,
): ResolutionArchetype {
  const ALL_ARCHETYPES: ResolutionArchetype[] = [
    'paradox_as_ground', 'irruptive_revelation', 'mythic_cosmogony',
    'ethical_imperative', 'definitional_arrival', 'tragic_acceptance',
    'relational_reconfiguration',
  ];

  // Build blocked set from tension incompatibilities
  const blocked = new Set(
    ARCHETYPE_INCOMPATIBLE
      .filter(([t]) => t === tensionType)
      .map(([, a]) => a),
  );

  const viable = ALL_ARCHETYPES.filter(a => !blocked.has(a));

  // Weight each archetype by (mode, tension, strategy) triple
  const w: Record<ResolutionArchetype, number> = {
    paradox_as_ground: 0,
    irruptive_revelation: 0,
    mythic_cosmogony: 0,
    ethical_imperative: 0,
    definitional_arrival: 0,
    tragic_acceptance: 0,
    relational_reconfiguration: 0,
  };

  // Strategy → archetype affinity (primary driver)
  switch (completionStrategy) {
    case 'integrate': w.relational_reconfiguration += 3; w.paradox_as_ground += 2; break;
    case 'sever': w.irruptive_revelation += 3; w.tragic_acceptance += 2; break;
    case 'expose': w.definitional_arrival += 3; w.irruptive_revelation += 1; break;
    case 'collapse': w.irruptive_revelation += 2; w.tragic_acceptance += 3; break;
    case 'demand': w.ethical_imperative += 4; w.definitional_arrival += 1; break;
    case 'embody': w.mythic_cosmogony += 3; w.relational_reconfiguration += 2; break;
    case 'limit': w.definitional_arrival += 3; w.ethical_imperative += 1; break;
    case 'reverse': w.paradox_as_ground += 3; w.irruptive_revelation += 2; break;
    case 'destabilize_further': w.paradox_as_ground += 2; w.irruptive_revelation += 2; w.mythic_cosmogony += 1; break;
  }

  // Tension → archetype affinity (secondary)
  switch (tensionType) {
    case 'polarity': w.paradox_as_ground += 2; w.relational_reconfiguration += 1; break;
    case 'hierarchy': w.ethical_imperative += 2; w.irruptive_revelation += 1; break;
    case 'illusion': w.definitional_arrival += 2; w.irruptive_revelation += 1; break;
    case 'excess': w.tragic_acceptance += 2; w.irruptive_revelation += 1; break;
    case 'absence': w.ethical_imperative += 2; w.tragic_acceptance += 1; break;
    case 'sacrifice': w.tragic_acceptance += 3; w.ethical_imperative += 1; break;
    case 'identity_split': w.relational_reconfiguration += 2; w.paradox_as_ground += 1; break;
    case 'creation_destruction': w.irruptive_revelation += 2; w.paradox_as_ground += 1; break;
  }

  // Mode → archetype affinity (tertiary — weakest)
  switch (mode) {
    case 'dialectical': w.paradox_as_ground += 1; break;
    case 'irruptive': w.irruptive_revelation += 1; break;
    case 'revelatory': w.definitional_arrival += 1; break;
    case 'inversional': w.paradox_as_ground += 1; break;
    case 'mythic': w.mythic_cosmogony += 1; break;
    case 'ethical_directive': w.ethical_imperative += 1; break;
    case 'definitional': w.definitional_arrival += 1; break;
    case 'tragic_recognition': w.tragic_acceptance += 1; break;
    case 'relational_specific': w.relational_reconfiguration += 1; break;
  }

  // Cosmological boost for mythic_cosmogony
  if (interrogationMode === 'cosmological') {
    w.mythic_cosmogony += 2;
  }

  // Hash-weighted selection among viable archetypes
  const seed = hash(question + mode + tensionType + completionStrategy);
  const totalWeight = viable.reduce((sum, a) => sum + Math.max(w[a], 1), 0);
  const target = (seed % 1000) / 1000 * totalWeight;

  let cumulative = 0;
  for (const a of viable) {
    cumulative += Math.max(w[a], 1);
    if (cumulative >= target) return a;
  }
  return viable[0];
}

// ─── Per-Mode Thesis Generation ─────────────────────

function generateThesis(
  card: TarotCard,
  essence: ArchetypalEssence,
  question: string,
  questionDomain: QuestionDomain,
  questionKeywords: string[],
  previousState: ExistentialState | null,
  mode: TransformationMode,
  interrogationMode: InterrogationMode,
  depth: number,
): string {
  const qCore = extractQuestionCore(question);
  const s = hash(card.name + question + String(depth));

  const domainClaim = interrogationMode === 'cosmological' ? essence.cosmic
    : questionDomain === 'relational' ? essence.relational
    : questionDomain === 'ethical' ? essence.relational
    : essence.definition;

  switch (mode) {
    case 'dialectical': {
      if (depth === 1) {
        return pick([
          `**${card.name}** places the question on its true ground: ${domainClaim}.`,
          `Begin here: ${domainClaim}. **${card.name}** does not describe — it declares.`,
          `${domainClaim} — this is what **${card.name}** asserts when confronted with "${question}"`,
        ], s);
      }
      return pick([
        `**${card.name}** overturns the prior ground: ${domainClaim}. What was claimed before no longer stands unchallenged.`,
        `${domainClaim}. **${card.name}** does not extend what came before — it replaces the foundation entirely.`,
        `With **${card.name}**, the definition shifts: ${domainClaim}.`,
      ], s);
    }

    case 'irruptive': {
      return pick([
        `**${card.name}** erupts into the question as a force: ${essence.force}. This is not explanation but event.`,
        `${essence.force} — **${card.name}** does not explain. It breaks through, and the question fractures around it.`,
        `What enters through **${card.name}** is not a concept but an irruption: ${essence.force}. The frame of ${qCore} shatters.`,
      ], s);
    }

    case 'revelatory': {
      return pick([
        `**${card.name}** unveils what was already present but concealed: ${domainClaim}.`,
        `What was hidden becomes visible through **${card.name}**: ${domainClaim}. The concealment ends here.`,
        `**${card.name}** discloses: ${domainClaim}. This truth was always here — only now it stands exposed.`,
      ], s);
    }

    case 'inversional': {
      return pick([
        `**${card.name}** inverts the question. Seen from below: ${essence.paradox}.`,
        `Turn the question upside down. **${card.name}** reveals the inverted truth: ${essence.paradox}.`,
        `Through **${card.name}**, the perspective flips entirely: ${domainClaim} — but only visible from the inverted position.`,
      ], s);
    }

    case 'mythic': {
      return pick([
        `**${card.name}** tells a cosmic story: ${essence.cosmic}. The question of ${qCore} becomes a chapter in a myth older than language.`,
        `In the myth of **${card.name}**: ${essence.cosmic}. The question is no longer personal — it belongs to the cosmos.`,
        `**${card.name}** speaks the cosmogonic word: ${essence.cosmic}.`,
      ], s);
    }

    case 'ethical_directive': {
      return pick([
        `**${card.name}** does not describe — it demands. ${essence.force} is not a concept but an imperative: act from this.`,
        `The directive arrives through **${card.name}**: ${essence.force}. This is a command, not an observation.`,
        `**${card.name}** issues the imperative: to face ${qCore} requires ${essence.force}. Not understanding — action.`,
      ], s);
    }

    case 'definitional': {
      return pick([
        `**${card.name}** defines: ${domainClaim}. This is not a suggestion — it is what the cards declare.`,
        `The definition arrives through **${card.name}**: ${domainClaim}. Full stop.`,
        `${qCore} IS ${essence.force}. **${card.name}** does not argue — it states.`,
      ], s);
    }

    case 'tragic_recognition': {
      return pick([
        `**${card.name}** brings recognition: ${domainClaim}. This was always true — only now you see it.`,
        `Through **${card.name}**, what was denied becomes undeniable: ${domainClaim}. The recognition arrives.`,
        `**${card.name}** forces the encounter: ${domainClaim}. You knew this. You were not ready to know it.`,
      ], s);
    }

    case 'relational_specific': {
      return pick([
        `**${card.name}** speaks of the encounter: ${essence.relational}. The question of ${qCore} lives in the space between self and other.`,
        `In the presence of **${card.name}**, the relation speaks: ${essence.relational}.`,
        `**${card.name}** reveals the relational ground: ${essence.relational}. ${qCore} is not a solitary question.`,
      ], s);
    }
  }
}

// ─── Per-Mode Destabilization ───────────────────────

function generateDestabilization(
  card: TarotCard,
  essence: ArchetypalEssence,
  mode: TransformationMode,
  depth: number,
): string {
  const shadow = card.isReversed ? essence.shadow : essence.paradox;
  const s = hash(card.name + 'destab' + String(depth));

  switch (mode) {
    case 'dialectical': {
      return pick([
        `But the assertion carries its own negation: ${shadow}. The ground trembles beneath the claim just made.`,
        `Yet this claim contains its shadow: ${shadow}. What was declared now turns against its own foundation.`,
        `The contradiction arrives from inside: ${shadow}. No declaration escapes the polarity inscribed in its heart.`,
      ], s);
    }

    case 'irruptive': {
      return pick([
        `The eruption consumes as it creates: ${shadow}. What is born in violence inherits the violence of its origin.`,
        `In the aftermath of the irruption: ${shadow}. The force that shattered the frame also wounded what was inside it.`,
        `But irruption is not liberation: ${shadow}. What enters so forcefully destroys the very ground it sought.`,
      ], s);
    }

    case 'revelatory': {
      return pick([
        `The concealment was not accidental: ${shadow}. The hiding served a function — and that function is now exposed.`,
        `But what is unveiled brings its own shadow: ${shadow}. The truth concealed was concealed for a reason.`,
        `The disclosure wounds: ${shadow}. What the light reveals, the light also judges.`,
      ], s);
    }

    case 'inversional': {
      return pick([
        `The inversion reveals what the upright stance was suppressing: ${shadow}. Comfort was a form of blindness.`,
        `From the inverted position, the original view collapses: ${shadow}. What seemed stable was a maintained illusion.`,
        `Inversion costs: ${shadow}. To see from below is to lose the certainty that was possible above.`,
      ], s);
    }

    case 'mythic': {
      return pick([
        `But every myth carries its wound: ${shadow}. The cosmic story that explains everything conceals its own fracture.`,
        `The mythic voice falters here: ${shadow}. Even the cosmos has its unspeakable.`,
        `Within the creation narrative, a crack: ${shadow}. The myth is not whole — it carries what it cannot name.`,
      ], s);
    }

    case 'ethical_directive': {
      return pick([
        `The cost of following this imperative: ${shadow}. Every demand extracts its price in full.`,
        `But the directive is not free: ${shadow}. To act as commanded means facing what the action costs.`,
        `The imperative brings its burden: ${shadow}. Commitment without awareness of cost is recklessness.`,
      ], s);
    }

    case 'definitional': {
      return pick([
        `The definition excludes: ${shadow}. What is declared gains its sharpness from what it refuses.`,
        `But every definition is also an exclusion: ${shadow}. To say what something IS is to exile what it is NOT.`,
        `The boundary of the definition bleeds: ${shadow}. Precision comes at the cost of what lies just outside.`,
      ], s);
    }

    case 'tragic_recognition': {
      return pick([
        `The recognition costs: ${shadow}. To see clearly is to grieve what blindness protected.`,
        `But seeing brings grief: ${shadow}. The one who recognizes the truth can no longer be who they were before.`,
        `Recognition is also a wound: ${shadow}. What you now see, you cannot unsee — and innocence is forfeit.`,
      ], s);
    }

    case 'relational_specific': {
      return pick([
        `But the relation carries its wound: ${shadow}. No encounter is symmetric — the asymmetry bleeds.`,
        `The relational bond is not clean: ${shadow}. Between I and Thou, there is always an unhealed gap.`,
        `The encounter exposes: ${shadow}. What the bond reveals about each person is not always what they wished.`,
      ], s);
    }
  }
}

// ─── Per-Mode Reconfiguration ───────────────────────

function generateReconfiguration(
  card: TarotCard,
  essence: ArchetypalEssence,
  question: string,
  questionKeywords: string[],
  questionDomain: QuestionDomain,
  mode: TransformationMode,
  interrogationMode: InterrogationMode,
  depth: number,
): string {
  const qCore = extractQuestionCore(question);
  const s = hash(card.name + 'reconfig' + String(depth));

  switch (mode) {
    case 'dialectical': {
      return pick([
        `What ${qCore} becomes after the collision: a polarity that generates instead of destroying. **${card.name}** inscribes this tension as the new ground.`,
        `The ground is new: ${qCore} is what persists through its own confrontation. Not victory — endurance through polarity.`,
        `After the collision, ${qCore} is redefined: the tension between ${essence.force} and ${essence.shadow} becomes the terrain on which the question stands.`,
      ], s);
    }

    case 'irruptive': {
      return pick([
        `What endures after the irruption is not understanding but a landscape permanently altered. ${qCore} is no longer what it was before **${card.name}** arrived.`,
        `The irruption has passed. What persists: ${qCore} redefined by the force of ${essence.force}, scarred and new.`,
        `**${card.name}**'s force has passed through. The question of ${qCore} now stands in a different field, the old frame gone.`,
      ], s);
    }

    case 'revelatory': {
      return pick([
        `The unveiled truth stands on its own: ${qCore} is now visible as ${essence.force}, and this visibility is permanent.`,
        `What has been disclosed cannot be re-concealed. ${qCore} is ${essence.force} — and you have seen it.`,
        `After the unveiling, the question of ${qCore} has a different weight. **${card.name}** has made the hidden structure visible.`,
      ], s);
    }

    case 'inversional': {
      return pick([
        `Both views are now available — the upright and the inverted. ${qCore} requires holding both without choosing either as final.`,
        `After inversion, the original perspective loses its authority. ${qCore} now lives in permanent double vision: ${essence.force} and ${essence.paradox} simultaneously.`,
        `**${card.name}** leaves you with two truths at once. ${qCore} is the parallax between them — not one view, not the other.`,
      ], s);
    }

    case 'mythic': {
      return pick([
        `The myth completes itself: ${qCore} is a cosmogonic act, not a concept. **${card.name}** has inscribed it into the grammar of the cosmos.`,
        `The cosmic narrative absorbs the question: ${qCore} is no longer personal — it is the name of a pattern older than human speech.`,
        `**${card.name}**'s myth closes and opens: ${essence.cosmic}. The question of ${qCore} has become part of the cosmos recognizing itself.`,
      ], s);
    }

    case 'ethical_directive': {
      return pick([
        `The direction is set. ${qCore} is not something to understand but something to enact — with full knowledge of the cost **${card.name}** has named.`,
        `After the directive: ${qCore} names a commitment, not a concept. **${card.name}** has transformed the question into a demand for action.`,
        `The imperative stands. ${qCore} is now a path to walk, and **${card.name}** has made the cost of walking it visible.`,
      ], s);
    }

    case 'definitional': {
      return pick([
        `The definition has arrived and it does not waver: ${qCore} is ${essence.force}. **${card.name}**'s declaration stands, sharpened by what it excludes.`,
        `After exclusion, the definition gains edge: ${qCore} is precisely ${essence.force} — nothing more, nothing less. **${card.name}** has drawn the boundary.`,
        `The ontological claim is complete: **${card.name}** defines ${qCore} as ${essence.force}, and the definition holds.`,
      ], s);
    }

    case 'tragic_recognition': {
      return pick([
        `After recognition, return to innocence is impossible. ${qCore} is now what you see it as — and seeing has changed the one who sees.`,
        `The one who has seen through **${card.name}** is transformed. ${qCore} is no longer the question of someone who does not know.`,
        `Recognition has occurred. ${qCore} was always this — ${essence.force}. But now that you know, you are different from the one who asked.`,
      ], s);
    }

    case 'relational_specific': {
      return pick([
        `The relation reconfigures: ${qCore} is neither idealized bond nor broken one, but a living asymmetry that generates meaning between persons.`,
        `After the wound, the encounter stands changed: ${qCore} names a relational reality — not a concept held alone but a tension held between.`,
        `**${card.name}** reconfigures the relation: ${qCore} lives in the mutual transformation between I and Thou, not in either alone.`,
      ], s);
    }
  }
}

// ─── Embodiment Generation ──────────────────────────

function generateEmbodiment(
  card: TarotCard,
  mode: TransformationMode,
): SymbolicEmbodiment {
  const bank = EMBODIMENT_BANK[card.name] ?? EMBODIMENT_BANK['The Fool'];

  const embType: Record<TransformationMode, SymbolicEmbodiment['type']> = {
    mythic: 'mythic_scene',
    revelatory: 'mythic_scene',
    relational_specific: 'relational_dynamic',
    tragic_recognition: 'relational_dynamic',
    irruptive: 'concrete_image',
    inversional: 'concrete_image',
    dialectical: 'concrete_image',
    ethical_directive: 'relational_dynamic',
    definitional: 'concrete_image',
  };

  const type = embType[mode];
  let content: string;
  switch (type) {
    case 'concrete_image': content = bank.concrete; break;
    case 'relational_dynamic': content = bank.relational; break;
    case 'mythic_scene': content = bank.mythic; break;
  }

  return { type, content, cardSource: card.name };
}

// ─── State Evolution ────────────────────────────────

function evolveState(
  card: TarotCard,
  essence: ArchetypalEssence,
  previousState: ExistentialState | null,
  question: string,
  questionKeywords: string[],
  mode: TransformationMode,
  depth: number,
  role: SymbolicRole,
): ExistentialState {
  const qCore = extractQuestionCore(question);
  const primaryKw = card.keywords[0];

  const modeLabel: Record<TransformationMode, string> = {
    dialectical: 'tension between',
    irruptive: 'aftermath of',
    revelatory: 'unveiled truth of',
    inversional: 'inverted vision of',
    mythic: 'cosmic story of',
    ethical_directive: 'imperative toward',
    definitional: 'definition as',
    tragic_recognition: 'recognition of',
    relational_specific: 'encounter with',
  };

  const currentThesis = depth === 1
    ? `${qCore} as ${modeLabel[mode]} ${essence.force}`
    : `${qCore} through ${modeLabel[mode]} ${primaryKw}`;

  const tensionAxis = previousState
    ? `${previousState.tensionAxis} ↔ ${primaryKw}`
    : primaryKw;

  const unresolvedPolarity = card.isReversed || role === 'shadow'
    ? `${card.name}'s ${essence.shadow}`
    : previousState?.unresolvedPolarity ?? null;

  const directionMap: Record<SymbolicRole, string> = {
    anchor: 'grounding toward stable definition',
    catalyst: 'transformative movement through opposition',
    shadow: 'descent into what has been denied',
    bridge: 'integration of what seemed irreconcilable',
  };
  const ontologicalDirection = directionMap[role];

  return { currentThesis, tensionAxis, unresolvedPolarity, ontologicalDirection };
}

// ─── Resolution Archetype Determination (via TCE) ───

function determineResolutionArchetype(
  mode: TransformationMode,
  states: ExistentialState[],
  roles: SymbolicRole[],
  interrogationMode: InterrogationMode,
  question: string,
): { archetype: ResolutionArchetype; tensionType: TensionType; completionStrategy: CompletionStrategy } {
  const finalState = states[states.length - 1] ?? {
    currentThesis: '',
    tensionAxis: '',
    unresolvedPolarity: null,
    ontologicalDirection: '',
  };

  // 1. Classify the existential tension
  const tensionType = classifyTensionType(finalState, mode, roles, question);

  // 2. Select completion strategy (with incompatibility constraints)
  const completionStrategy = selectCompletionStrategy(tensionType, mode, finalState, question);

  // 3. Derive resolution archetype from the triple
  const archetype = deriveResolutionArchetype(
    mode, tensionType, completionStrategy, interrogationMode, question,
  );

  return { archetype, tensionType, completionStrategy };
}

// ─── Per-Archetype Synthesis Generation ─────────────

function generateSynthesis(
  question: string,
  questionKeywords: string[],
  steps: TransformationStep[],
  archetype: ResolutionArchetype,
  finalState: ExistentialState,
  mode: TransformationMode,
  interrogationMode: InterrogationMode,
): string {
  const qCore = extractQuestionCore(question);
  const cardNames = steps.map(s => s.cardName).join(', ');
  const s = hash(question + 'synth' + mode);

  switch (archetype) {
    case 'paradox_as_ground': {
      return pick([
        `Through ${cardNames}, the reading arrives at a paradox that IS the ground. ${qCore} is the lived tension of ${finalState.tensionAxis} — a polarity that generates rather than destroys.`,
        `${cardNames} reveal: ${qCore} is not resolved but inhabited. The tension of ${finalState.tensionAxis} is not a problem — it is the structure of the real.`,
        `The paradox stands as ground: ${qCore}, through ${cardNames}, is the tension of ${finalState.tensionAxis} held without collapse. This is not failure to resolve — it is the shape of what is true.`,
      ], s);
    }

    case 'irruptive_revelation': {
      return pick([
        `What erupted through ${cardNames} has permanently altered the field. ${qCore} is no longer what it was before the force of ${finalState.tensionAxis} broke through. The old frame is gone.`,
        `Through ${cardNames}: the question of ${qCore} has been irrupted. The force of ${finalState.tensionAxis} has shattered the prior understanding and left a new landscape in its place.`,
        `${cardNames} did not answer — they erupted. ${qCore} is the name of the field after the force of ${finalState.tensionAxis} passed through it. You stand in new terrain.`,
      ], s);
    }

    case 'mythic_cosmogony': {
      if (interrogationMode === 'cosmological') {
        return pick([
          `${cardNames} compose a cosmogonic act: ${qCore} is not a fact to discover but a myth to participate in. ${finalState.tensionAxis} — these are the forces through which the cosmos tells its own story.`,
          `Through ${cardNames}, the myth speaks: ${qCore} is a name the cosmos gives to the pattern of ${finalState.tensionAxis}. The question was always part of the creation narrative.`,
          `The cosmogonic word has been spoken through ${cardNames}: ${qCore} belongs to the ongoing myth of the cosmos recognizing itself through ${finalState.tensionAxis}.`,
        ], s);
      }
      return pick([
        `${cardNames} tell a mythic story: ${qCore} is woven into a narrative larger than the personal. ${finalState.tensionAxis} — these are the cosmic forces that gave the question its shape.`,
        `Through ${cardNames}: the myth absorbs ${qCore}. The forces of ${finalState.tensionAxis} are not answers but the grammar of a story in which the question participates.`,
        `${cardNames} weave ${qCore} into the cosmic pattern of ${finalState.tensionAxis}. The question becomes a chapter in an ongoing myth, not a problem to solve.`,
      ], s);
    }

    case 'ethical_imperative': {
      return pick([
        `Through ${cardNames}, the reading points not to understanding but to action. ${qCore} is a directive: face ${finalState.tensionAxis} and choose. The cards demand — they do not explain.`,
        `${cardNames} converge on an imperative: ${qCore} is not something to contemplate but something to enact. The path runs through ${finalState.tensionAxis}, and the cost has been named.`,
        `The directive stands through ${cardNames}: ${qCore} requires a committed act toward ${finalState.ontologicalDirection}. This reading is a demand, not a description.`,
      ], s);
    }

    case 'definitional_arrival': {
      return pick([
        `Through ${cardNames}, the definition arrives: ${qCore} IS ${finalState.currentThesis}. This is not interpretation — it is declaration. The cards have drawn the boundary.`,
        `${cardNames} define: ${qCore} is precisely what the forces of ${finalState.tensionAxis} name it to be. The definition is complete, and it stands without apology.`,
        `The reading arrives at a definition through ${cardNames}: ${qCore} is ${finalState.currentThesis}. Not approximation — ontological declaration.`,
      ], s);
    }

    case 'tragic_acceptance': {
      return pick([
        `Through ${cardNames}, recognition has occurred: ${qCore} was always ${finalState.currentThesis}. The tragedy is not the truth itself but the time spent not seeing it. Now you see.`,
        `${cardNames} bring the recognition: ${qCore} names what was always present — ${finalState.tensionAxis} — but was too painful to acknowledge. The seeing is the transformation.`,
        `After ${cardNames}: ${qCore} stands revealed as what it always was. The acceptance is not passive — it is the act of a consciousness that can no longer look away from ${finalState.tensionAxis}.`,
      ], s);
    }

    case 'relational_reconfiguration': {
      return pick([
        `Through ${cardNames}, the encounter reconfigures: ${qCore} is not a concept held alone but a tension held between persons. ${finalState.tensionAxis} names the living asymmetry of the bond.`,
        `${cardNames} reveal: ${qCore} lives in the relational space where ${finalState.tensionAxis} generates mutual transformation. The question was always about the encounter.`,
        `The relation has been reconfigured through ${cardNames}: ${qCore} is the name of a bond shaped by ${finalState.tensionAxis} — neither idealized nor destroyed, but alive.`,
      ], s);
    }
  }
}

// ─── Hybrid LLM Articulation Layer ──────────────────

interface LLMArticulationInput {
  question: string;
  interrogationMode: InterrogationMode;
  transformationMode: TransformationMode;
  cardSequence: Array<{ name: string; role: SymbolicRole; keywords: string[]; isReversed: boolean }>;
  steps: TransformationStep[];
  finalState: ExistentialState;
  resolutionArchetype: ResolutionArchetype;
  synthesis: string;
  embodiments: SymbolicEmbodiment[];
}

/**
 * Produce the final embodied existential articulation.
 *
 * LLM INTEGRATION POINT:
 * Replace this function body with an actual LLM call when a backend is available.
 * The prompt should include: question, transformationMode, cardSequence, finalState,
 * resolutionArchetype, embodiments.
 * Constraints: no structural jargon, no system explanation, no template repetition,
 * mode-appropriate existential-phenomenological voice.
 */
function llmArticulate(input: LLMArticulationInput): string {
  const { question, transformationMode, steps, synthesis, embodiments } = input;

  const sections: string[] = [];

  // Mode-aware opening
  const openings: Record<TransformationMode, string> = {
    dialectical: `"${question}" — this question holds a tension it does not yet know. The cards name it.`,
    irruptive: `"${question}" — the cards do not explain. They erupt. Enter at your own risk.`,
    revelatory: `"${question}" — what was hidden is about to be shown. The cards lift the veil.`,
    inversional: `"${question}" — turn it upside down. The cards see from below.`,
    mythic: `"${question}" — this is a myth. The cosmos tells it through the cards.`,
    ethical_directive: `"${question}" — the cards do not answer. They command.`,
    definitional: `"${question}" — the cards define. Listen, and know.`,
    tragic_recognition: `"${question}" — you already know. The cards force you to see it.`,
    relational_specific: `"${question}" — this question lives between persons, not inside one. The cards speak the encounter.`,
  };

  sections.push(openings[transformationMode]);
  sections.push('');

  for (const step of steps) {
    sections.push(`${step.thesis} ${step.destabilization} ${step.reconfiguration}`);
    sections.push('');
  }

  if (embodiments.length > 0) {
    const embText = embodiments.map(e => `*${e.content}*`).join(' ');
    sections.push(embText);
    sections.push('');
  }

  sections.push(synthesis);

  return sections.join('\n');
}

// ─── Question Framing ───────────────────────────────

function frameQuestion(question: string, mode: InterrogationMode): string {
  if (!question.trim()) {
    if (mode === 'cosmological') return 'The cards speak without a constraining question — archetypal forces reveal themselves.';
    if (mode === 'divinatory') return 'No question constrains this reading. The forces move freely.';
    return 'This reading speaks without a question — the cards open a space for encounter.';
  }

  if (mode === 'cosmological') {
    return `"${question}" — a question the cosmos has been asking of itself since before there were words.`;
  }
  if (mode === 'divinatory') {
    return `"${question}" — the cards respond not with reassurance but with truth.`;
  }
  return `"${question}" — let the cards define what this question truly demands.`;
}

// ─── Disclaimers ────────────────────────────────────

function getDisclaimer(mode: InterrogationMode): string {
  if (mode === 'cosmological') {
    return 'This is a symbolic-mythic articulation, not a scientific or empirical claim. ' +
      'The cards speak as archetypal forces — what they reveal is pattern and resonance, not fact.';
  }
  if (mode === 'divinatory') {
    return 'This reading offers a symbolic reflection, not a deterministic prediction. ' +
      'No causal, prophetic, or fated claim is made. The meaning remains open to your agency.';
  }
  return 'This is an existential-philosophical articulation through symbolic encounter. ' +
    'It does not prescribe, predict, or assert empirical fact.';
}

// ─── Public API ─────────────────────────────────────

export function generateQuestionTargetedNarrative(
  config: SymbolicConfiguration,
  spread: PlacedCard[],
  biasVector: InterpretiveBiasVector,
  lens: InterpretiveWeightVector,
  context: UserProfileContext,
  question: string,
): QuestionTargetedNarrative {
  const interrogationMode = lens.mode;
  const questionKeywords = extractQuestionKeywords(question);
  const questionDomain = classifyQuestionDomain(question);
  const questionMode = detectQuestionMode(question);

  // Gather card info for mode selection
  const cardNames = spread.map(p => p.card.name);
  const roles: SymbolicRole[] = spread.map(p =>
    config.dominantArchetypes.find(a => a.cardId === p.card.id)?.role ?? 'anchor',
  );
  const reversedCount = spread.filter(p => p.card.isReversed).length;

  // 1. Select transformation mode
  const transformationMode = selectTransformationMode(
    questionDomain, interrogationMode, cardNames, roles,
    reversedCount, spread.length, question,
  );

  // 2. Frame the question
  const questionRestatement = frameQuestion(question, interrogationMode);

  // 3. Transformation engine — process each card
  const transformationSteps: TransformationStep[] = [];
  const cardExplanations: QuestionTargetedNarrative['cardExplanations'] = [];
  const existentialStates: ExistentialState[] = [];
  const embodiments: SymbolicEmbodiment[] = [];
  let currentState: ExistentialState | null = null;

  for (let i = 0; i < spread.length; i++) {
    const placed = spread[i];
    const card = placed.card;
    const archEntry = config.dominantArchetypes.find(a => a.cardId === card.id);
    if (!archEntry) continue;

    const essence = ESSENCES[card.name] ?? ESSENCES['The Fool'];
    const depth = i + 1;
    const role = archEntry.role;

    // Thesis
    const thesis = sanitize(generateThesis(
      card, essence, question, questionDomain, questionKeywords,
      currentState, transformationMode, interrogationMode, depth,
    ));

    // Destabilization
    const destabilization = sanitize(generateDestabilization(
      card, essence, transformationMode, depth,
    ));

    // Reconfiguration
    const reconfiguration = sanitize(generateReconfiguration(
      card, essence, question, questionKeywords, questionDomain,
      transformationMode, interrogationMode, depth,
    ));

    // Apply narrative variation for syntactic diversity across cards
    const varied = applyNarrativeVariation(
      thesis, destabilization, reconfiguration,
      card.name, role, depth, questionMode,
    );

    // Embodiment
    const embodiment = generateEmbodiment(card, transformationMode);
    embodiments.push(embodiment);

    // Evolve state
    currentState = evolveState(
      card, essence, currentState,
      question, questionKeywords, transformationMode, depth, role,
    );
    existentialStates.push(currentState);

    const step: TransformationStep = {
      depth,
      cardName: card.name,
      role,
      transformationMode,
      thesis: varied.thesis,
      destabilization: varied.destabilization,
      reconfiguration: varied.reconfiguration,
      embodiment,
      existentialState: { ...currentState },
    };

    transformationSteps.push(step);

    cardExplanations.push({
      cardName: card.name,
      role,
      contribution: `${thesis} ${destabilization} ${reconfiguration}`,
    });
  }

  // 4. Determine resolution archetype via Tension Completion Engine
  const finalState = existentialStates[existentialStates.length - 1] ?? {
    currentThesis: '',
    tensionAxis: '',
    unresolvedPolarity: null,
    ontologicalDirection: '',
  };
  const { archetype: resolutionArchetype, tensionType, completionStrategy } = determineResolutionArchetype(
    transformationMode, existentialStates, roles, interrogationMode, question,
  );

  // 5. Generate synthesis
  const synthesis = sanitize(generateSynthesis(
    question, questionKeywords, transformationSteps,
    resolutionArchetype, finalState, transformationMode, interrogationMode,
  ));

  // 6. LLM articulation
  const llmInput: LLMArticulationInput = {
    question,
    interrogationMode,
    transformationMode,
    cardSequence: spread.map(p => ({
      name: p.card.name,
      role: config.dominantArchetypes.find(a => a.cardId === p.card.id)?.role ?? 'anchor',
      keywords: p.card.keywords,
      isReversed: p.card.isReversed,
    })),
    steps: transformationSteps,
    finalState,
    resolutionArchetype,
    synthesis,
    embodiments,
  };
  const llmArticulationText = llmArticulate(llmInput);

  // 7. Compose full narrative
  const disclaimer = getDisclaimer(interrogationMode);
  const sections: string[] = [questionRestatement, ''];

  for (const step of transformationSteps) {
    sections.push(step.thesis);
    sections.push(step.destabilization);
    sections.push(step.reconfiguration);
    sections.push('');
  }

  if (embodiments.length > 0) {
    sections.push(embodiments.map(e => `*${e.content}*`).join(' '));
    sections.push('');
  }

  sections.push(synthesis);
  sections.push('', '---', '', `*${disclaimer}*`);

  let fullNarrative = sections.join('\n');

  // 8. Validate narrative quality
  const narrativeForValidation: QuestionTargetedNarrative = {
    questionRestatement,
    transformationMode,
    transformationSteps,
    existentialState: finalState,
    resolutionArchetype,
    tensionType,
    completionStrategy,
    cardExplanations,
    synthesis,
    embodiments,
    llmArticulation: llmArticulationText,
    fullNarrative,
    disclaimer,
    cardReferences: {},
  };
  const validation = validateNarrative(narrativeForValidation);
  if (!validation.valid) {
    fullNarrative = generateSafeFallback(questionRestatement, transformationSteps, disclaimer);
  }

  // Card references
  const cardReferences: Record<string, string> = {};
  for (const expl of cardExplanations) {
    cardReferences[expl.cardName] = expl.contribution;
  }

  return {
    questionRestatement,
    transformationMode,
    transformationSteps,
    existentialState: finalState,
    resolutionArchetype,
    tensionType,
    completionStrategy,
    cardExplanations,
    synthesis,
    embodiments,
    llmArticulation: llmArticulationText,
    fullNarrative,
    disclaimer,
    cardReferences,
  };
}
