function doSearch(searchValue, advanced) {
    // Tarpinio serviso url:
    // "https://www.geoportal.lt/mapproxy/elasticsearch_service";
    // Užklausos pavyzdys į tarpinį servisą - https://www.geoportal.lt/mapproxy/elasticsearch_service?q=kaunas
    // Tarpinis servisas, gavęs paieškos žodį, suformuoja užklausą (https://github.com/zudc-neip/Vietovardziai-API-Maps užklausa-1.txt, užklausa-3.txt), kreipiasi į Elasticsearch API _search metodą ir grąžina rezultatą.
	// https://www.geoportal.lt/mapproxy/elasticsearch_gvdr. Tai adresas į Elasticsearch API _search metodą.
	// Naudodami šį metodą POST užklausomis galite vykdyti įvairaus sudėtingumo (advanced) paiešką GV_DRLT rinkinyje.
    var url = "http://www.geoportal.lt/mapproxy/elasticsearch_gvdr";
    if (advanced) {
        var params = getQueryParams(searchValue, 0, 20, false);
        fetch(url, {
            method: "POST",
            body: JSON.stringify(params),
            headers: {
                "Accept": "application/json",
            }
        }).then(function (response) {
            if (response.status == 200) {
                return response.json();
            }
        }).then(function (json) {
            if (json && json.hits) {
                var percentage = 0.60;
                modifyResponse(json, percentage);
                if (json.hits.total.value > 0) {
                    if (typeof displayResults === "function") {
                        displayResults(json.hits.hits, true);
                    }
                } else {
                    var params = getQueryParams(searchValue, 0, 20, true);
                    fetch(url, {
                        method: "POST",
                        body: JSON.stringify(params),
                        headers: {
                            "Accept": "application/json",
                        }
                    }).then(function (response) {
                        if (response.status == 200) {
                            return response.json();
                        }
                    }).then(function (json) {
                        if (json && json.hits) {
                            modifyResponse(json, percentage);
                            if (typeof displayResults === "function") {
                                displayResults(json.hits.hits, true);
                            }
                        }
                    });
                }
            }
        });
    } else {
        url += "?q=" + encodeURIComponent(searchValue)
        fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        }).then(function (response) {
            if (response.status == 200) {
                return response.json();
            }
        }).then(function (json) {
            if (json && json.hits) {
                modifyResponse(json);
                if (typeof displayResults === "function") {
                    displayResults(json.hits.hits, true);
                }
            }
        });
    }
}

function modifyResponse(response, percentage) {
    if (response.hits.hits) {
        var items = [],
        currentItem,
        maxScore,
        geom;
        for (var i = 0; i < response.hits.hits.length; i++) {
            currentItem = response.hits.hits[i];
            if (percentage) {
                if (maxScore && currentItem._score < maxScore * percentage) {
                    continue;
                }
                maxScore = currentItem._score;
            }
            geom = currentItem._source.esri_json.replace(/&quot/g, "");
            geom = geom.replace(/\);\s?/g, "),");
            geom = geom.replace(/;/g, "],[");
            geom = geom.replace(/\(\(/g, "[[[");
            geom = geom.replace(/\)\)/g, "]]]");
            geom = geom.replace(/\(/g, "[[");
            geom = geom.replace(/\)/g, "]]");
            geom = geom.replace(/\s/g, ",");
            geom = eval(geom);
            currentItem.geom = geom;
            items.push(currentItem);
        }
        response.hits.hits = items;
    }
}

function getQueryParams(query, start, limit, isFuzzy) {
    start = start || 0;
    limit = limit || 20;
    isFuzzy = isFuzzy || false;
    var queryParams;
    var filter = [];
    var multiMatchQuery = {
        "multi_match": {
            "query": query,
            "type": "phrase",
            "fields": ["name^5", "namegenitive^5", "name.shingle^4", "namegenitive.shingle^4", "municipality^3"],
            "slop": 5
        }
    };
    var multiMatchPath,
    q;
    q = multiMatchQuery;
    multiMatchPath = q.multi_match;
    var mustNot = [{
            "match": {
                "namestatus": "istorinis"
            }
        }
    ];
    if (!/[0-9]/.test(query)) {
        mustNot.push({
            "match": {
                "subtype": "adresas"
            }
        });
    }
    queryParams = {
        "query": {
            "function_score": {
                "query": {
                    "bool": {
                        "must": q,
                        "must_not": mustNot,
                        "filter": filter
                    }
                },
                "functions": [{
                        "filter": {
                            "term": {
                                "localtype": "Gyvenvietės"
                            }
                        },
                        "weight": 1.34
                    }, {
                        "filter": {
                            "term": {
                                "localtype": "Administracinis vienetas"
                            }
                        },
                        "weight": 1.33
                    }, {
                        "filter": {
                            "term": {
                                "localtype": "Hidrografija"
                            }
                        },
                        "weight": 1.32
                    }, {
                        "filter": {
                            "term": {
                                "localtype": "Transporto tinklas"
                            }
                        },
                        "weight": 1.31
                    }, {
                        "filter": {
                            "term": {
                                "localtype": "Saugomos teritorijos"
                            }
                        },
                        "weight": 1.30
                    }, {
                        "filter": {
                            "term": {
                                "localtype": "Žemės danga"
                            }
                        },
                        "weight": 1.29
                    }, {
                        "filter": {
                            "term": {
                                "localtype": "Reljefas"
                            }
                        },
                        "weight": 1.28
                    }, {
                        "filter": {
                            "term": {
                                "localtype": "Statinys"
                            }
                        },
                        "weight": 1.27
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "miestas"
                            }
                        },
                        "weight": 1.25
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "miesto dalis"
                            }
                        },
                        "weight": 1.24
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "miestelis"
                            }
                        },
                        "weight": 1.23
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "seniūnija"
                            }
                        },
                        "weight": 1.22
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "kaimas"
                            }
                        },
                        "weight": 1.21
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "kaimo dalis"
                            }
                        },
                        "weight": 1.20
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "viensėdis"
                            }
                        },
                        "weight": 1.19
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "gatvė"
                            }
                        },
                        "weight": 1.17
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "stotelė"
                            }
                        },
                        "weight": 1.16
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "upė"
                            }
                        },
                        "weight": 1.15
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "ežeras"
                            }
                        },
                        "weight": 1.14
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "tvenkinys"
                            }
                        },
                        "weight": 1.13
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "miškas"
                            }
                        },
                        "weight": 1.12
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "pelkė"
                            }
                        },
                        "weight": 1.11
                    }, {
                        "filter": {
                            "term": {
                                "subtype": "adresas"
                            }
                        },
                        "weight": 1.10
                    }
                ]
            }
        },
        "sort": ["_score", {
                "gyvsk": "desc"
            }, "name"],
        "from": start,
        "size": limit
    };
    if (isFuzzy) {
        multiMatchPath.type = "most_fields";
        multiMatchPath.fields = ["name^5", "namegenitive^5", "name.shingle^4", "namegenitive.shingle^4", "name.folded^3", "namegenitive.folded^3", "name.edge^2", "namegenitive.edge^2", "name.trigram^1", "namegenitive.trigram^1", "municipality^3"];
    }
    return queryParams;
}
