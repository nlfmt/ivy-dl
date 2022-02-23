import React, { useState, useEffect } from 'react'

import "./downloads.less"

import AppPage from '../../components/AppPage/AppPage'
import DropdownMenu from '../../components/DropdownMenu/DropdownMenu'
import CheckBox from '../../components/ToggleButton/ToggleButton'
import Download from './Download/Download'

import FlipMove from 'react-flip-move'

import { ArrowDownwardRounded, SearchRounded } from '@material-ui/icons'


  // TODO: implement download date and upload date
const sortOptions = {
    0: "Date",
    1: "Size",
    2: "Length",
    3: "Views",
    4: "Likes",
    5: "Dislikes",
    6: "Comments",
}

const titles = [
    '"Please Reload, Bro"',
    'Why LESS Sensitive Tests Might Be Better',
    'What your GD ship says about you',
    'Build a WEB3 app to mint unlimited NFTs… But should you?',
    "The shortest game of Magnus Carlsen's chess career!",
    "World's Luckiest People!"
  ]


const { dlMgr } = electron;



// https://www.peterbe.com/plog/a-darn-good-search-filter-function-in-javascript
function searchDownloads(q, list) {
    list = [...list];
    function escapeRegExp(s) {
      return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    const words = q
      .split(/\s+/g)
      .map(s => s.trim())
      .filter(s => !!s);
    const hasTrailingSpace = q.endsWith(" ");
    const searchRegex = new RegExp(
      words
        .map((word, i) => {
          if (i + 1 === words.length && !hasTrailingSpace) {
            // The last word - ok with the word being "startswith"-like
            return `(?=.*\\b${escapeRegExp(word)})`;
          } else {
            // Not the last word - expect the whole word exactly
            return `(?=.*\\b${escapeRegExp(word)}\\b)`;
          }
        })
        .join("") + ".+",
      "gi"
    );

    const searchStr = str => {
        return str && str.search(searchRegex) != -1;
    }

    return list.filter(dl => {
        return searchStr(dl.title)
            || searchStr(dl.description)
            || searchStr(dl.uploader);
    });
}


function Downloads() {

    const [downloads, setDownloads] = useState([
        // Object.assign({...downloadData}, {info:{title: 1}}),
        // Object.assign({...downloadData}, {info:{title: 2}}),
        // Object.assign({...downloadData}, {info:{title: 3}})
    ]);
    const [sort, setSort] = useState({
        type: 0,
        order: 0, // 0 - desc, 1 - asc
    });
    const [ searchTerm, setSearchTerm ] = useState("");
    const [isListening, setIsListening] = useState(false);

    
    useEffect(() => {

        // Initial Download loading
        dlMgr.loadDownloads().then((dlData) => {
            setDownloads(dlData);
        });

        // get new downloads
        const cb = (dl) => {
            console.log("new download", dl);

            dlMgr.onceInfo(dl.url, (info) => {
                setDownloads(dls => {
                    return dls.map(d => {
                        if (d.url === dl.url) {
                            Object.assign(d, info);
                        }
                        return d;
                    });
                });
                setSort(s => {return {...s}});
            });

            setDownloads(dls => {
                dls = Array(...dls); // copy array to avoid mutating original
                dls.unshift(dl);
                return dls;
            });
        }
        dlMgr.onNewDownload(cb);

        return () => {
            dlMgr.offNewDownload(cb);
        }
    }, []);

    // re-sort the downloads
    useEffect(() => {
        console.log(downloads);
        console.log("re-sort, type:", sortOptions[sort.type], "order:", sort.order);
        let fn;
        switch (sortOptions[sort.type]) {
            case "Date":
                fn = (a, b) => {
                    return a.date > b.date ? -1 : 1;
                };
                break;
            case "Size":
                fn = (a, b) => a.size > b.size ? -1 : 1;
                break;
            case "Length":
                fn = (a, b) => a.duration < b.duration ? -1 : 1;
                break;
            case "Views":
                fn = (a, b) => a.views > b.views ? -1 : 1;
                break;
            case "Likes":
                fn = (a, b) => a.likes > b.likes ? -1 : 1;
                break;
            case "Dislikes":
                fn = (a, b) => a.dislikes > b.dislikes ? -1 : 1;
                break;
            case "Comments":
                fn = (a, b) => a.comments > b.comments ? -1 : 1;
                break;
        }

        console.log(fn)

        if (fn) {
            setDownloads(dls => {
                let newDls = dls.sort((a,b) => {
                    // console.log("comparing a:", a.info.views, " to b:", b.info.views);
                    // console.log("result:", fn(a,b) * (sort.order == 0 ? 1 : -1));
                    return fn(a,b) * (sort.order == 0 ? 1 : -1);
                });
                console.log("sorted", newDls.map(d => d.title));
                return [...newDls];
            });
        }

    }, [sort, downloads.length])

    // titles.forEach(t => {
    //     const dl = downloads.find(d => d.title == t);
    //     if (!dl) return;
    //     console.log(dl.title, /(?=.*\bw).+/gi.test(t));
    //     console.log(t, /(?=.*\bw).+/gi.test(t));
    // });

    let searchedDls;
    if (searchTerm == "") {
        searchedDls = downloads;
    } else {
        searchedDls = searchDownloads(searchTerm, downloads);
    }

    return (
        <AppPage name="downloads">
            <div className="searchBar">
                <div className="search">
                    <SearchRounded className="searchIcon" />
                    <input
                        type="text"
                        placeholder="Search"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {searchTerm != "" ?
                    <span className="info">{searchedDls.length}/{downloads.length} Videos</span>
                    : <span className="info">{downloads.length} Videos</span>
                }
                <div className="sortOptions">
                    <DropdownMenu
                        label="Sort by"
                        default={0}
                        onChange={(type) =>
                            setSort((s) => {
                                return { ...s, type };
                            })
                        }
                        options={sortOptions}
                    />
                    <CheckBox
                        default={sort.order}
                        onChange={(order) =>
                            setSort((s) => {
                                return { ...s, order: order ? 0 : 1 };
                            })
                        }
                    >
                        <ArrowDownwardRounded />
                    </CheckBox>
                </div>
            </div>

            {/*
             * key has to be unique and be passed down to the child
             * can't use index since FlipMove then thinks the order doesnt change
             * arrow components need to use forwardRef()
             */}
            <FlipMove
                className="downloadList"
                duration={400}
                staggerDelayBy={20}
                enterAnimation="fade"
                appearAnimation="fade"
                leaveAnimation="fade"
                easing="ease"
            >
                {searchedDls.length == 0 ? (
                    downloads.length == 0 ? (
                        <div className="emptyMsg">No Downloads yet.</div>
                    ) : (
                        <div className="emptyMsg">
                            No results could be found.
                        </div>
                    )
                ) : (
                    searchedDls.map((dl) => {
                        return (
                            <Download key={`${dl.date} ${dl.url}`} dl={dl} />
                        );
                    })
                )}
            </FlipMove>

            <div className="toolBar">
                <button onClick={() => {}} className="optionsBtn">Options</button>
                <button onClick={() => navigator.clipboard.readText().then(dlMgr.new)} className="downloadBtn">Download</button>
                <button onClick={() => {dlMgr.toggleListener(); setIsListening(!isListening)}} className={isListening ? "active" : ""}>Auto</button>
            </div>
        </AppPage>
    );
}

export default Downloads
