/* const db = import ( '../../database');
const user = import( '../../user');
const posts = import ('../../posts');
const privileges = import ('../../privileges');
const meta = import ('../../meta'); */


/* import * as db from '../../database';
import * as user from '../../user';
import * as posts from '../../posts';
import * as privileges from '../../privileges';
import * as meta from '../../meta'; */

import db from '../../database';
import user from '../../user';
import posts from '../../posts';
import privileges from '../../privileges';
import meta from '../../meta';

/* import db = require('../../database');
import user = require('../../user');
import posts = require('../../posts');
import privileges = require('../../privileges');
import meta = require('../../meta'); */


type dataType = {
    pid: number,
    cid: number
}

type socketType = {
    uid: number
}

type votersDataType = {
    upvoteCount: number,
    downvoteCount: number,
    showDownvotes: boolean,
    upvoters: string[],
    downvoters: string[]
}

type SocketPostsType= {
    getVoters: (socket: socketType, data: dataType) => Promise<votersDataType>,
    getUpvoters: (socket: socketType, pids: number[]) => Promise<{ otherCount: number; usernames: string[]; }[]>
}

export = function (SocketPosts: SocketPostsType) { // add return type
    SocketPosts.getVoters = async function (socket: socketType, data: dataType): Promise<votersDataType> {
        if (!data || !data.pid || !data.cid) {
            throw new Error('[[error:invalid-data]]');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const showDownvotes = !meta.config['downvote:disabled'];
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const canSeeVotes: boolean = meta.config.votesArePublic as boolean ||
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await privileges.categories.isAdminOrMod(data.cid, socket.uid) as boolean;
        if (!canSeeVotes) {
            throw new Error('[[error:no-privileges]]');
        }
        const [upvoteUids, downvoteUids]: [number[], number[]] = await Promise.all([
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            db.getSetMembers(`pid:${data.pid}:upvote`) as number[],
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            showDownvotes ? db.getSetMembers(`pid:${data.pid}:downvote`) as number[] : [],
        ]);

        const [upvoters, downvoters]: [string[], string[]] = await Promise.all([
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            user.getUsersFields(upvoteUids, ['username', 'userslug', 'picture']) as string[],
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            user.getUsersFields(downvoteUids, ['username', 'userslug', 'picture'])as string[],
        ]);

        const upvoteCount: number = upvoters.length;
        const downvoteCount: number = downvoters.length;

        return {
            upvoteCount: upvoteCount,
            downvoteCount: downvoteCount,
            showDownvotes: showDownvotes,
            upvoters: upvoters,
            downvoters: downvoters,
        };
    };

    SocketPosts.getUpvoters = async function (socket: socketType, pids: number[]) {
        if (!Array.isArray(pids)) {
            throw new Error('[[error:invalid-data]]');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const data: number[][] = await posts.getUpvotedUidsByPids(pids) as number[][];
        if (!data.length) {
            return [];
        }

        const result = await Promise.all(data.map(async (uids: number[]) => {
            let otherCount = 0;
            if (uids.length > 6) {
                otherCount = uids.length - 5;
                uids = uids.slice(0, 5);
            }
            const usernames: string[] = await user.getUsernamesByUids(uids) as string[];
            return {
                otherCount: otherCount,
                usernames: usernames,
            };
        }));
        return result;
    };
}
