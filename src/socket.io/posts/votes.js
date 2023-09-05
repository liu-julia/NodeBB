"use strict";
/* const db = import ( '../../database');
const user = import( '../../user');
const posts = import ('../../posts');
const privileges = import ('../../privileges');
const meta = import ('../../meta'); */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../../database"));
const user_1 = __importDefault(require("../../user"));
const posts_1 = __importDefault(require("../../posts"));
const privileges_1 = __importDefault(require("../../privileges"));
const meta_1 = __importDefault(require("../../meta"));
function default_1(SocketPosts) {
    SocketPosts.getVoters = function (socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data || !data.pid || !data.cid) {
                throw new Error('[[error:invalid-data]]');
            } // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const showDownvotes = !meta_1.default.config['downvote:disabled'];
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const canSeeVotes = meta_1.default.config.votesArePublic ||
                (
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                yield privileges_1.default.categories.isAdminOrMod(data.cid, socket.uid));
            if (!canSeeVotes) {
                throw new Error('[[error:no-privileges]]');
            }
            const [upvoteUids, downvoteUids] = yield Promise.all([
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                database_1.default.getSetMembers(`pid:${data.pid}:upvote`),
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                showDownvotes ? database_1.default.getSetMembers(`pid:${data.pid}:downvote`) : [],
            ]);
            const [upvoters, downvoters] = yield Promise.all([
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                user_1.default.getUsersFields(upvoteUids, ['username', 'userslug', 'picture']),
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                user_1.default.getUsersFields(downvoteUids, ['username', 'userslug', 'picture']),
            ]);
            const upvoteCount = upvoters.length;
            const downvoteCount = downvoters.length;
            return {
                upvoteCount: upvoteCount,
                downvoteCount: downvoteCount,
                showDownvotes: showDownvotes,
                upvoters: upvoters,
                downvoters: downvoters,
            };
        });
    };
    SocketPosts.getUpvoters = function (socket, pids) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(pids)) {
                throw new Error('[[error:invalid-data]]');
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const data = yield posts_1.default.getUpvotedUidsByPids(pids);
            if (!data.length) {
                return [];
            }
            const result = yield Promise.all(data.map((uids) => __awaiter(this, void 0, void 0, function* () {
                let otherCount = 0;
                if (uids.length > 6) {
                    otherCount = uids.length - 5;
                    uids = uids.slice(0, 5);
                }
                const usernames = yield user_1.default.getUsernamesByUids(uids);
                return {
                    otherCount: otherCount,
                    usernames: usernames,
                };
            })));
            return result;
        });
    };
}
exports.default = default_1;
