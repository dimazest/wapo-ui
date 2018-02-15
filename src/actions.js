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
