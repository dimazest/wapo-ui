import {push} from 'redux-first-routing'
import decodeUriComponent from 'decode-uri-component'
import {actions as notifActions} from 'redux-notifications'

import qs from 'qs'


export const RENDER_NEW_QUERY = 'RENDER_NEW_QUERY'
export const renderNewQuery = (resetActiveHit=false) => {
    return {
        type: RENDER_NEW_QUERY,
        resetActiveHit
    }
}


export const submitQuery = (resetActiveHit=false) => {
    return (dispatch, getState) => {
        dispatch(renderNewQuery(resetActiveHit))

        const query = getState().frontend.queryText.current

        document.title = getState().frontend.queryText.new
        dispatch(push({hash: query}))

        const size = getState().frontend.size

        if (query) {
            return window.client.search(
                {
                    body: {
                        size,
                        query: {
                            query_string: {
                                query,
                                default_operator: 'and',
                            },
                        },
                        highlight: {
                            fields: {
                                title: {number_of_fragments: 0},
                                text: {},
                            },
                            pre_tags: ['<mark>'],
                            post_tags: ['</mark>']
                        }
                    }
                }
            ).then(body => {dispatch(hitsReceived(body))})
        }
    }
}


export const CHANGE_QUERY = 'CHANGE_QUERY'
export const changeQuery = text => {
    return {
        type: CHANGE_QUERY,
        text,
    }
}


export const HASH_UPDATED = 'HASH_UPDATED'
export const hashUpdated = hash => {
    const query = hash ? decodeUriComponent(hash).slice(1) : ''

    return {
        type: HASH_UPDATED,
        hash, query
    }
}


export const HITS_RECEIVED = 'HITS_RECEIVED'
export const hitsReceived = body => {
    return {
        type: HITS_RECEIVED,
        body: body,
    }
}

export const INCREASE_HITS_COUNT = 'INCREASE_HIT_COUNT'
export const increaseHitsCount = () => {
    return {
        type: INCREASE_HITS_COUNT
    }
}

export const LINK_CLICK = 'LINK_CLICK'
export const linkClick = i => {
    return {
        type: LINK_CLICK,
        i
    }
}


export const CHANGE_SELECTION = 'CHANGE_SELECTION'
export const selectNext = (by=1) => ({type: CHANGE_SELECTION, by})
export const selectPrevious = (by=-1) => ({type: CHANGE_SELECTION, by})

export const QUERY_INPUT_FOCUS_CHANGE = 'QUERY_INPUT_FOCUS_CHANGE'
export const queryInputFocusChange = (focused=true) => ({
        type: QUERY_INPUT_FOCUS_CHANGE, focused
})

export const RELEVANCE_CLICK = 'RELEVANCE_CLICK'
export const relevanceClick = (user, query, docID, judgment=true) => (
    dispatch => fetch(
        `${window.api_root}/relevance`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Accept': 'application/vnd.pgrst.object+json',
                'Prefer': 'resolution=merge-duplicates,return=representation',
            },
            body: JSON.stringify({
                user_name: user,
                query: query,
                document_id: docID,
                judgment: judgment,
            })})
        .then(r => r.json())
        .then(d => dispatch({
            type: RELEVANCE_CLICK,
            user: d.user_name,
            query: d.query,
            docID: d.document_id,
            judgment: d.judgment,
        })))


export const LOAD_JUDGMENTS = 'LOAD_JUDGMENTS'
export const loadJudgments = payload => ({type: LOAD_JUDGMENTS, payload})


export const SET_CREDENTIALS = 'SET_CREDENTIALS'
export const setCredentials = (userName) => (
    dispatch => {
        dispatch({type: SET_CREDENTIALS, userName})

        if (!userName) {return}

        const params = qs.stringify({user_name: `eq.${userName}`})

        return fetch(`${window.api_root}/relevance?${params}`)
            .then(r => r.json())
            .then(d => dispatch(loadJudgments(d)))
    }
)


export const LOAD_TOPIC_INFO = 'LOAD_TOPIC_INFO'
export const TOGGLE_TOPIC_FORM = 'TOGGLE_TOPIC_FORM'
export const toggleTopicForm = (showTopicForm=true) => (
    (dispatch, getState) => {

        const state = getState()
        const query = state.frontend.queryText.current
        const user = state.frontend.user
        if (showTopicForm) {
            const params = qs.stringify({query: `eq.${query}`, user_name: `eq.${user}`})
            return fetch(`${window.api_root}/topic?${params}`)
                .then(r => r.json())
                .then(d => {
                    dispatch({type: LOAD_TOPIC_INFO, payload: (d.length ? d[0] : {})})
                    dispatch({type: TOGGLE_TOPIC_FORM, showTopicForm})
                })
        } else {
            dispatch({type: TOGGLE_TOPIC_FORM, showTopicForm})
        }

    }
)

export const SAVE_TOPIC = 'SAVE_TOPIC'
export const saveTopic = (title, description, narrative) => (
    (dispatch, getState) => {
        const state = getState()
        const query = state.frontend.queryText.current
        const user_name = state.frontend.user

        return fetch(
            `${window.api_root}/topic`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/vnd.pgrst.object+json',
                    'Prefer': 'resolution=merge-duplicates,return=representation',
                },
                body: JSON.stringify({
                    user_name, query, title, description, narrative,
                })})
            .then(response => {
                if(response.ok) { return response.json()}

                throw new Error('Could not save the topic.')
            })
            .then(d => dispatch(notifActions.notifSend({
                message: 'Topic saved.',
                kind: 'info',
                dismissAfter: 2000,
            })))
            .catch(error => dispatch(notifActions.notifSend({
                message: error.message,
                kind: 'warning',
                dismissAfter: 2000,
            })))
    }
)

export const TOPICS_RECEIVED = 'TOPICS_RECEIVED'
export const topicsReceived = topics => ({
    type: TOPICS_RECEIVED,
    topics,
})

export const RELEVANCE_RECEIVED = 'RELEVANCE_RECEIVED'
export const relevanceReceived = data => {
    return dispatch => {
        let relevance = {}
        let doc_ids = []

        for (let i in data){
            let {user_name, query, document_id, judgment} = data[i]

            relevance[user_name] = {
                ...relevance[user_name],
                [query]: {
                    ...(relevance[user_name] || {})[query],
                    [document_id]: {document_id, judgment}
                }
            }

            doc_ids.push(document_id)
        }

        return window.client.mget({
            index: 'wapo',
            body: {ids: doc_ids}
        }).then(r => {
            let docInfo = {}
            for (let i in r.docs) {
                let {_id, _source} = r.docs[i]
                docInfo[_id] = _source
            }
            return dispatch({
                type: RELEVANCE_RECEIVED,
                relevance,
                docInfo,
            })
        })
    }
}
