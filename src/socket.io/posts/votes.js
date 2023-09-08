"use strict";
/* const db = import ( '../../database');
const user = import( '../../user');
const posts = import ('../../posts');
const privileges = import ('../../privileges');
const meta = import ('../../meta'); */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/* import * as db from '../../database';
import * as user from '../../user';
import * as posts from '../../posts';
import * as privileges from '../../privileges';
import * as meta from '../../meta'; */
const database_1 = __importDefault(require("../../database"));
const user_1 = __importDefault(require("../../user"));
const posts_1 = __importDefault(require("../../posts"));
const privileges_1 = __importDefault(require("../../privileges"));
const meta_1 = __importDefault(require("../../meta"));
module.exports = function (SocketPosts) {
    SocketPosts.getVoters = async function (socket, data) {
        if (!data || !data.pid || !data.cid) {
            throw new Error('[[error:invalid-data]]');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const showDownvotes = !meta_1.default.config['downvote:disabled'];
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const canSeeVotes = meta_1.default.config.votesArePublic ||
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await privileges_1.default.categories.isAdminOrMod(data.cid, socket.uid);
        if (!canSeeVotes) {
            throw new Error('[[error:no-privileges]]');
        }
        const [upvoteUids, downvoteUids] = await Promise.all([
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            database_1.default.getSetMembers(`pid:${data.pid}:upvote`),
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            showDownvotes ? database_1.default.getSetMembers(`pid:${data.pid}:downvote`) : [],
        ]);
        const [upvoters, downvoters] = await Promise.all([
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
    };
    SocketPosts.getUpvoters = async function (socket, pids) {
        if (!Array.isArray(pids)) {
            throw new Error('[[error:invalid-data]]');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const data = await posts_1.default.getUpvotedUidsByPids(pids);
        if (!data.length) {
            return [];
        }
        const result = await Promise.all(data.map(async (uids) => {
            let otherCount = 0;
            if (uids.length > 6) {
                otherCount = uids.length - 5;
                uids = uids.slice(0, 5);
            }
            const usernames = await user_1.default.getUsernamesByUids(uids);
            return {
                otherCount: otherCount,
                usernames: usernames,
            };
        }));
        return result;
    };
};
