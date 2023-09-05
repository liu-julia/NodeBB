/* const db = import ( '../../database');
const user = import( '../../user');
const posts = import ('../../posts');
const privileges = import ('../../privileges');
const meta = import ('../../meta'); */


import db from '../../database';
import user from '../../user';
import posts from '../../posts';
import privileges from '../../privileges';
import meta from '../../meta';

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
    upvoters: any,
    downvoters: any
}

type SocketPosts = {
    getVoters: (socket: socketType, data: dataType) => Promise<votersDataType>,
    getUpvoters: any
}

export default function (SocketPosts: SocketPosts) { // add return type
    SocketPosts.getVoters = async function (socket: socketType, data: dataType): Promise<votersDataType> {
        if (!data || !data.pid || !data.cid) {
            throw new Error('[[error:invalid-data]]');
        }// The next line calls a function in a module that has not been updated to TS yet
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

        const [upvoters, downvoters] = await Promise.all([
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            user.getUsersFields(upvoteUids, ['username', 'userslug', 'picture']),
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            user.getUsersFields(downvoteUids, ['username', 'userslug', 'picture']),
        ]);

        const upvoteCount: number = upvoters.length as number;
        const downvoteCount: number = downvoters.length as number;

        return {
            upvoteCount: upvoteCount,
            downvoteCount: downvoteCount,
            showDownvotes: showDownvotes,
            upvoters: upvoters,
            downvoters: downvoters,
        };
    };

    SocketPosts.getUpvoters = async function (socket, pids: number[]) {
        if (!Array.isArray(pids)) {
            throw new Error('[[error:invalid-data]]');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const data: any[] = await posts.getUpvotedUidsByPids(pids);
        if (!data.length) {
            return [];
        }

        const result = await Promise.all(data.map(async (uids: number[]) => {
            let otherCount = 0;
            if (uids.length > 6) {
                otherCount = uids.length - 5;
                uids = uids.slice(0, 5);
            }
            const usernames: string[] = await user.getUsernamesByUids(uids);
            return {
                otherCount: otherCount,
                usernames: usernames,
            };
        }));
        return result;
    };
}
