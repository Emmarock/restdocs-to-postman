/*
 * Copyright 2018 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Converts Insomnia export format v3 to Postman Collection Format v2.1.0
 */
'use strict';
const url = require('url');

const toPostmanKeyValues = (insomniaNameValues) => {
    return insomniaNameValues.map(e => {
        return {
            key: e.name,
            value: e.value
        };
    });
};

const toPostmanBody = (insomniaBody) => {
    if (insomniaBody.text) {
        // for mime types like application/json
        return {
            mode: 'raw',
            raw: insomniaBody.text
        };
    } else if (insomniaBody.params && insomniaBody.mimeType === 'application/x-www-form-urlencoded') {
        return {
            mode: 'urlencoded',
            urlencoded: toPostmanKeyValues(insomniaBody.params)
        };
    } else if (insomniaBody.params) {
        return {
            mode: 'formdata',
            formdata: toPostmanKeyValues(insomniaBody.params)
        };
    } else {
        return null;
    }
};

const toPostmanItem = (insomniaItem) => {
    let rawUrl = insomniaItem.url;
    const parsedUrl = url.parse(rawUrl);
    let host = parsedUrl.protocol + "//" + (parsedUrl.auth ? parsedUrl.auth : '') + parsedUrl.host;
    let header;
    if (insomniaItem.headers) {
        header = toPostmanKeyValues(insomniaItem.headers);
    }
    let query;
    if (parsedUrl.query) {
        query = parsedUrl.query.split('&').map(q => {
            const parts = q.split('=');
            if (parts.length !== 2) {
                throw new Error('Invalid query part: ' + q);
            }
            return {
                key: parts[0],
                value: parts[1],
            }
        });
    }
    return {
        name: insomniaItem.name,
        request: {
            method: insomniaItem.method,
            header: header,
            body: toPostmanBody(insomniaItem.body),
            url: {
                raw: rawUrl,
                host: [
                    host
                ],
                path: parsedUrl.pathname.split('/'),
                query: query
            },
            description: insomniaItem.description
        }
    };
};

const toPostmanFolder = (insomniaRequestGroup) => {
    return {
        name: insomniaRequestGroup.name,
        item: []
    }
};

module.exports.toPostmanCollection = (insomniaCollection) => {
    const folderMap = {};
    insomniaCollection.resources
        .filter(r => r._type === 'request_group')
        .forEach(r => folderMap[r._id] = toPostmanFolder(r));

    // Folders come first and are sorted by name.
    const topLevelItems = Object.values(folderMap).sort((a, b) => a.name.localeCompare(b.name));

    insomniaCollection.resources
        .filter(r => r._type === 'request')
        .forEach(r => {
            if (folderMap[r.parentId]) {
                folderMap[r.parentId].item.push(toPostmanItem(r));
            } else {
                topLevelItems.push(toPostmanItem(r))
            }
        });
    return {
        info: {
            name: 'REST Docs to Postman',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: topLevelItems
    };
};
