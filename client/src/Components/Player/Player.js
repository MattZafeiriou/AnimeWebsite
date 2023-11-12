import React, { createRef } from 'react';
import {createRoot} from 'react-dom/client';
import './Player.css'
import Plyr from "plyr-react"
import "plyr-react/plyr.css"

class Player extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded_info: false,
            title: "",
            episode: "",
            description: "",
            genre: "",
            studios: [],
            relatedFolders: [],
            relatedNames: [],
            img: "",
            episodesno: "",
            premiered: "",
            season: "",
            episodesdu: ""
        };
        this.customStyle = {
            backgroundColor: 'hsl(0, 60%, 30%)',
            color: 'white',
            border: '3px #9b2727 solid',
            width: '2.3em',
            height: '2.3em',
            padding: '0px',
            float: 'left',
            marginRight: '1em',
            marginBottom: '1em'
        }

        this.customSelectedStyle = {
            backgroundColor: 'hsl(0, 60%, 30%)',
            color: 'white',
            border: '3px hsl(0, 60%, 70%) solid',
            boxShadow: '0px 0px 3px hsl(0, 60%, 70%)',
            width: '2.3em',
            height: '2.3em',
            padding: '0px',
            float: 'left',
            marginRight: '1em',
            marginBottom: '1em'
        }
        this.plyrProps = {
            source: {
                type: 'video',
                title: 'Example video',
                sources: [
                    {
                        src: '',
                        type: 'video/mp4',
                        size: 1080
                    }
                ]
            }, // https://github.com/sampotts/plyr#the-source-setter
        }
        this.player = createRef();
        this.getVideoInfo = this.getVideoInfo.bind(this);
        this.getVideoInfo();
        this.render = this.render.bind(this);
        this.MyPlyrVideo = this.MyPlyrVideo.bind(this);
        this.setCookies = this.setCookies.bind(this);
    }


    getVideoInfo()
    {
        let name = window.location.href.split("/")[4];
        this.state.episode = window.location.href.split("/")[5].replace("ep", "");

        // Change banner image
        var url = "anime_url/?name=" + name + "&ep=" + this.state.episode;
        fetch("http://localhost:9000/" + url)
        .then(res => res.text())
        .then(data => {
            const myVideo= document.getElementsByClassName('plyr__video-wrapper')[0];
            for (const child of myVideo.children) {
                if (child.tagName === 'VIDEO')
                {
                    child.setAttribute('src', data);
                    break;
                }
            }
            this.setCookies();
        })
        .catch(error => {
            console.error('Error fetching anime url:', error);
        });

        url = "get_video/?name=" + name;
        let data;
        fetch("http://localhost:9000/" + url)
        .then(res => res.text())
        .then(res => {
            data = res;
            let info = JSON.parse(data);
            this.setState({title: info.name});
            this.setState({description: info.description});
            this.setState({genre: info.genre});
            this.setState({studios: info.studios});
            this.setState({loaded_info: info.true});
            this.setState({episodesno: info.episodes});
            this.setState({premiered: info.premiered});
            this.setState({season: info.season});
            this.setState({episodesdu: info.duration + " min/ep"});
            this.setState({relatedFolders: info.other_seasons_folders});
            this.setState({relatedNames: info.other_seasons_names}, () => {this.setRelatedAnime();});

            let oof = false;
            if (this.state.episode == 1)
            {
                oof = true;
                document.getElementById("next_ep").children[0].href = "ep" + (parseInt(this.state.episode) + 1);
                const btn = document.getElementById("previous_ep").children[0];
                btn.style.opacity = '0.5';
                btn.style.color = 'gray';
                btn.classList.remove('button');
                btn.classList.add('button_disabled');
                btn.children[0].innerHTML = "No Previous Episode";
            }
            if (info.episodes == this.state.episode)
            {
                oof = true;
                document.getElementById("previous_ep").children[0].href = "ep" + (parseInt(this.state.episode) - 1);
                const btn = document.getElementById("next_ep").children[0];
                btn.style.opacity = '0.5';
                btn.style.color = 'gray';
                btn.classList.remove('button');
                btn.classList.add('button_disabled');
                btn.children[0].innerHTML = "No Next Episode";
            }
            if (!oof) 
            {
                document.getElementById("previous_ep").children[0].href = "ep" + (parseInt(this.state.episode) - 1);
                document.getElementById("next_ep").children[0].href = "ep" + (parseInt(this.state.episode) + 1);
            }

            const tagsDiv = document.getElementById('tags');
            // Create anime tags
            for (let i = 0; i < info.genre.length; i++)
            {
                const newDiv = document.createElement('div');
                tagsDiv.appendChild(newDiv);
                // Render the component into the new div
                const root = createRoot(newDiv);
                root.render(<this.Tag name={info.genre[i]}/>)
            }
            // Create anime episode buttons
            const epsDiv = document.getElementById('episodes');
            if (info.episodes > 1)
                for (let i = 1; i <= info.episodes; i++)
                {
                    const newDiv = document.createElement('div');
                    epsDiv.appendChild(newDiv);
                    // Render the component into the new div
                    const root = createRoot(newDiv);
                    if (i == this.state.episode)
                        root.render(<this.Button text={i} customStyle={this.customSelectedStyle}/>)
                    else
                        root.render(<this.Button text={i} link={"ep" + i} customStyle={this.customStyle}/>)
                }
            
        });
        // Change banner image
        var url = "get_image/?name=" + name;
        fetch("http://localhost:9000/" + url)
        .then(res => res.arrayBuffer())
        .then(data => {
            const blob = new Blob([data], { type: 'image/jpeg' }); // Adjust the type as per your image format
            const imgUrl = URL.createObjectURL(blob);

            this.setState({img: imgUrl});
            this.state.loaded_info = true;
        })
        .catch(error => {
            console.error('Error fetching image:', error);
        });
    }
    
    getCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for(let i=0;i < ca.length;i++) {
            let c = ca[i];
            while (c.charAt(0)===' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    eraseCookie(name) {   
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    setCookie(name, value, days) {
        let expires = "";
        if (days) {
          let date = new Date();
          date.setTime(date.getTime() + (days*24*60*60*1000));
          expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/p" + "; SameSite=None; Secure";
    }

    setCookies() {
        // get and change time and volume to last session's
        let currentTime = this.getCookie("currentTime");
        let currentVolume = this.getCookie("currentVolume");
        const plyrInstance = this.player.current.plyr;

        if (currentTime)
            plyrInstance.currentTime = parseInt(currentTime);

        if (currentVolume)
            plyrInstance.currentVolume = parseInt(currentTime);
        
        // Save current time and volume every second
        setInterval(() =>{
            this.setCookie("currentTime", plyrInstance.currentTime, 7);
            this.setCookie("currentVolume", plyrInstance.volume, 7);
        }, 1000);
    }



    MyPlyrVideo() {
        return <Plyr ref={this.player} {...this.plyrProps} />
    }

    Button = (proms) => {
        return (
            <>
                <a className='button' type='button' href={proms.link} style={proms.customStyle}>
                    <div style={{textAlign: 'center', lineHeight: '1.9em'}}>
                        {proms.text}
                    </div>
                </a>
            </>
        );
    }

    Info = (proms) => {
        return (
            <div className='pcontainer' style={{marginBottom: '0px', marginTop: '.1em'}}>
                <div className='info_'>
                    <h2 className='info_tag'>{proms.name}</h2>
                    <h2 className='info_text'>{proms.text}</h2>
                </div>
            </div>
        );
    }

    Tag = (proms) => {
        return (
            <>
                <h5 className='anime_tag'>{proms.name}</h5>
            </>
        );
    }

    setRelatedAnime() {
        // Change banner image
        for(let i = 0; i < this.state.relatedFolders.length; i++)
        {
            let url = "get_image/?name=" + this.state.relatedFolders[i];
            let imgUrl = "";

            fetch("http://localhost:9000/" + url)
            .then(res => res.arrayBuffer())
            .then(data => {
                const blob = new Blob([data], { type: 'image/jpeg' }); // Adjust the type as per your image format
                imgUrl = URL.createObjectURL(blob);

                url = "get_video/?name=" + this.state.relatedFolders[i];
                fetch("http://localhost:9000/" + url)
                .then(res2 => res2.text())
                .then(res2 => {
                    let data2 = res2;
                    let info = JSON.parse(data2);

                    let vname = info.name;
                    let vep = info.episodes;
                    let season = info.season;
                    let vlink = "/p/" + info.folder_name + "/ep1";
                    let raDiv = document.getElementsByClassName('related_anime_div')[0];
                    const newDiv = document.createElement('div');
                    raDiv.appendChild(newDiv);
                    // Render the component into the new div
                    const root = createRoot(newDiv);
                    root.render(<this.RelatedAnime title={vname} link={vlink} season={season} img={imgUrl} epsno={vep}/>)
                })
            })
            .catch(error => {
                console.error('Error fetching image:', error);
            });
        }
    }

    RelatedAnime = (proms) => {
        return (
            <>
                <div className='related_anime'>
                    <a href={proms.link}><img id={proms.img_id} className='related_anime_img' src={proms.img}/></a>
                    <div style={{display: 'block'}}>
                        <h3 className='related_anime_title'><a href={proms.link}>{proms.title}</a></h3>
                        <h5 className='related_anime_info'>Season {proms.season} <span>&#8226;</span> {proms.epsno} episodes</h5>
                    </div>
                </div>
            </>
        );
    }

    render() {
        // if (!this.state.loaded_info)
        // {
        //     return (
        //         <div/>
        //     );
        // }
        return (
        <><link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
            <div className="gradient"></div>
            <div className='playerdiv'>
                <div className='playerr'>
                    <div className='title'>
                        <h3 id='title'>{this.state.title} - Episode {this.state.episode}</h3>
                    </div>
                    <div className="main_player">
                        <div className='player'>
                            <this.MyPlyrVideo id='videoPlayer'/>
                        </div>
                        <div className='separator'/>
                        <div className='pcontainer'>
                            <div id="previous_ep">
                                <this.Button id="previous_ep" text="Previous Episode" customStyle={{backgroundColor: '#9b2727', color: 'white', width: '35%', float: 'left'}}/>
                            </div>
                            <div id="next_ep">
                                <this.Button id="next_ep" text="Next Episode" customStyle={{backgroundColor: '#9b2727', color: 'white', width: '35%', float: 'right'}}/>
                            </div>
                        </div>
                        <div id="episodes" className='pcontainer'>
                        </div>
                        <div className='separator'/>
                        <div className='pcontainer'>
                            <div style={{marginBottom: '1em'}}>
                                <div style={{display: 'flex'}}>
                                    <img className='anime_img' src={this.state.img}/>
                                    <div style={{display: 'block'}}>
                                        <h2 id='anime_desc'>Description</h2>
                                        <div className='separator'/>
                                        <p style={{marginTop: '1em'}} id='anime_description'>{this.state.description}</p>
                                        <div id='tags' className='tags'>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='separator'/>
                            <div style={{marginTop: '1em'}}>
                                <div className='anime_info'>
                                    <this.Info name='Season' text={this.state.season}/>
                                    <this.Info name='Publisher' text={this.state.studios}/>
                                    <this.Info name='Episodes' text={this.state.episodesno}/>
                                    <this.Info name='Duration' text={this.state.episodesdu}/>
                                    <this.Info name='Premiered' text={this.state.premiered}/>
                                </div>
                            </div>
                            <div style={{margin:'1em'}}/>
                        </div>
                    </div>
                </div>
                <div className='right_side'>
                    <div className='section related_anime_div'>
                        <h3 className='section_title'>Related Anime</h3>
                    </div>
                </div>
            </div>
        </>
    );
    };
}
export default Player;