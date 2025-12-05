// challenges.js
// Initial scaffold for future challenges.

const CHALLENGES = [
    {
        id: "challenge_entropy_only",
        nameKey: "challenge_entropy_only_name",
        descKey: "challenge_entropy_only_desc",
        modifier: { disable_evil: true },
        reward: { seeds: 2 }
    }
];

if (typeof window !== "undefined") {
    window.CHALLENGES = CHALLENGES;
}
