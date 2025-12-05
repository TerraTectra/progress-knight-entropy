// achievements.js
// Declarative achievements list.

const ACHIEVEMENTS = [
    // Universe progression
    {
        id: "reach_universe_2",
        group: "progress",
        nameKey: "achv_reach_u2_name",
        descKey: "achv_reach_u2_desc",
        condition: { type: "universe_at_least", value: 2 },
    },
    // Seeds milestones
    {
        id: "seeds_5",
        group: "entropy",
        nameKey: "achv_seeds_5_name",
        descKey: "achv_seeds_5_desc",
        condition: { type: "seeds_total_at_least", value: 5 },
    },
    {
        id: "seeds_25",
        group: "entropy",
        nameKey: "achv_seeds_25_name",
        descKey: "achv_seeds_25_desc",
        condition: { type: "seeds_total_at_least", value: 25 },
    },
    // Evil milestones
    {
        id: "embrace_evil_once",
        group: "evil",
        nameKey: "achv_evil_once_name",
        descKey: "achv_evil_once_desc",
        condition: { type: "embrace_evil_times_at_least", value: 1 },
    },
    {
        id: "evil_500",
        group: "evil",
        nameKey: "achv_evil_500_name",
        descKey: "achv_evil_500_desc",
        condition: { type: "evil_current_at_least", value: 500 },
    },
    // Patterns
    {
        id: "patterns_sum_20",
        group: "patterns",
        nameKey: "achv_patterns_20_name",
        descKey: "achv_patterns_20_desc",
        condition: { type: "pattern_levels_sum_at_least", value: 20 },
    },
    // Short-life mastery
    {
        id: "perfect_short_life",
        group: "lifetime",
        nameKey: "achv_shortlife_name",
        descKey: "achv_shortlife_desc",
        condition: { type: "made_perfect_short_life" },
    },
    // Artifacts
    {
        id: "u2_artifact_first",
        group: "progress",
        nameKey: "achv_u2_artifact_name",
        descKey: "achv_u2_artifact_desc",
        condition: { type: "owns_any_u2_artifact" },
    },
    // Entropy thresholds
    {
        id: "entropy_1e6",
        group: "entropy",
        nameKey: "achv_entropy_1e6_name",
        descKey: "achv_entropy_1e6_desc",
        condition: { type: "entropy_total_at_least", value: 1_000_000 },
    },
    // Rebirths
    {
        id: "rebirths_50",
        group: "lifetime",
        nameKey: "achv_rebirths_50_name",
        descKey: "achv_rebirths_50_desc",
        condition: { type: "rebirths_at_least", value: 50 },
    },
];

if (typeof window !== "undefined") {
    window.ACHIEVEMENTS = ACHIEVEMENTS;
}
