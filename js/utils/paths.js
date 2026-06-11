// paths.js

const isGithubPages =
    window.location.hostname === "mother-s-milk.github.io";

export const BASE_PATH = isGithubPages
    ? "/pizzaFusionFrontend"
    : "";

export const buildPath = (path) => {
    return `${BASE_PATH}/${path}`.replace(/\/+/g, "/");
};