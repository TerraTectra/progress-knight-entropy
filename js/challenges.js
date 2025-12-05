// challenges.js
// Declarative challenges list with modifiers, conditions, and rewards.

const CHALLENGES = [
    {
        id: "entropy_purist",
        group: "core",
        nameKey: "ch_entropy_purist_name",
        descKey: "ch_entropy_purist_desc",
        modifiers: {
            disable_evil: true,
            disable_dark_magic: true,
        },
        condition: { type: "reach_universe_at_least", value: 2 },
        reward: { seeds: 2 },
    },
    {
        id: "evil_lord",
        group: "core",
        nameKey: "ch_evil_lord_name",
        descKey: "ch_evil_lord_desc",
        modifiers: {
            boost_evil_gain: 0.25,
            disable_shop: true,
        },
        condition: { type: "evil_total_at_least", value: 2000 },
        reward: { seeds: 1, evil: 250 },
    },
    {
        id: "short_life_master",
        group: "lifetime",
        nameKey: "ch_shortlife_master_name",
        descKey: "ch_shortlife_master_desc",
        modifiers: {
            force_short_life_mode: true,
        },
        condition: { type: "perfect_short_life_times_at_least", value: 3 },
        reward: { seeds: 1 },
    },
    {
        id: "pattern_weaver",
        group: "patterns",
        nameKey: "ch_pattern_weaver_name",
        descKey: "ch_pattern_weaver_desc",
        modifiers: {
            slower_xp_gain: 0.15,
            slower_money_gain: 0.15,
        },
        condition: { type: "pattern_levels_sum_at_least", value: 40 },
        reward: { seeds: 2 },
    },
];

if (typeof window !== "undefined") {
    window.CHALLENGES = CHALLENGES;
}
