import {push} from 'redux-first-routing'
import decodeUriComponent from 'decode-uri-component'


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
    dispatch => {(
        fetch(
            `${window.api_root}/relevance`,
            {
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
                    judgment: judgment ? 1 : 0,
                })
            },
        )
            .then(r => r.json())
            .then(d => dispatch({
                type: RELEVANCE_CLICK,
                user: d.user_name,
                query: d.query,
                docID: d.document_id,
                judgment: d.judgment,
            }))
    )}
)


export const SET_CREDENTIALS = 'SET_CREDENTIALS'
export const setCredentials = (userName) => ({
    type: SET_CREDENTIALS,
    userName
})

export const TOGGLE_TOPIC_FORM = 'TOGGLE_TOPIC_FORM'
export const toggleTopicForm = () => ({type: TOGGLE_TOPIC_FORM})
