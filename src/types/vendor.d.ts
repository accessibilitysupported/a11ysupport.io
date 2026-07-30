/**
 * Ambient declarations for dependencies that ship no type definitions and have none published.
 * Both are used only by the maintainer CLI scripts (scripts/*.ts), never in the server or
 * client — narrow `any`-typed access there is an acceptable, contained trade-off.
 */
declare module 'github-api';
declare module 'node-fetch';
