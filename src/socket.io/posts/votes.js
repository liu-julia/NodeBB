"use strict";
/* const db = import ( '../../database');
const user = import( '../../user');
const posts = import ('../../posts');
const privileges = import ('../../privileges');
const meta = import ('../../meta'); */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db = __importStar(require("../../database"));
const user = __importStar(require("../../user"));
const posts = __importStar(require("../../posts"));
const privileges = __importStar(require("../../privileges"));
const meta = __importStar(require("../../meta"));
function default_1(SocketPosts) {
    SocketPosts.getVoters = function (socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data || !data.pid || !data.cid) {
                throw new Error('[[error:invalid-data]]');
            } // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const showDownvotes = !meta.config['downvote:disabled'];
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const canSeeVotes = meta.config.votesArePublic ||
                (
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                yield privileges.categories.isAdminOrMod(data.cid, socket.uid));
            if (!canSeeVotes) {
                throw new Error('[[error:no-privileges]]');
            }
            const [upvoteUids, downvoteUids] = yield Promise.all([
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                db.getSetMembers(`pid:${data.pid}:upvote`),
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                showDownvotes ? db.getSetMembers(`pid:${data.pid}:downvote`) : [],
            ]);
            const [upvoters, downvoters] = yield Promise.all([
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                user.getUsersFields(upvoteUids, ['username', 'userslug', 'picture']),
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                user.getUsersFields(downvoteUids, ['username', 'userslug', 'picture']),
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
            const data = yield posts.getUpvotedUidsByPids(pids);
            if (!data.length) {
                return [];
            }
            const result = yield Promise.all(data.map((uids) => __awaiter(this, void 0, void 0, function* () {
                let otherCount = 0;
                if (uids.length > 6) {
                    otherCount = uids.length - 5;
                    uids = uids.slice(0, 5);
                }
                const usernames = yield user.getUsernamesByUids(uids);
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
