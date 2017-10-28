import React, { Component } from 'react';
import * as firebase from "firebase";
import config from './../../config.json';
import { Link } from 'react-router-dom';
import dateformat from 'dateformat';

import TrackListItem from './TrackListItem';
import InfoButton from './InfoButton';
import SpotifyIcon from 'mdi-react/SpotifyIcon';
import Images from './../images/Images';
import Loading from './Loading';

import './../styles/InfoPage.css';
import './../styles/ProfileInfo.css';

class ProfileInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user : this.props.match ? this.props.match.params.user : this.props.user,
            profile: undefined,
            loading: true,
            topTracksExpanded: false,
            topArtistsExpanded: false,
        }

        if (firebase.apps.length === 0) {
            firebase.initializeApp(config.firebase);
        }

        this.toggleTopArtistsExpanded = this.toggleTopArtistsExpanded.bind(this);
        this.toggleTopTracksExpanded = this.toggleTopTracksExpanded.bind(this);
    }

    toggleTopTracksExpanded() {
        this.setState({topTracksExpanded: !this.state.topTracksExpanded});
    }

    toggleTopArtistsExpanded() {
        this.setState({topArtistsExpanded: !this.state.topArtistsExpanded});
    }

    componentDidMount() {
        this.getProfile(this.state.user);
    }

    getProfile(user) {
        let _this = this;

        const rootRef = firebase.database().ref('users/' + btoa(user));
        
        rootRef.child('profile').once('value').then(profile => {
            if (profile.val()) {
                _this.setState({profile: profile.val()});
            } else {
                _this.setState({loading: false});
            }
        });
    }

    getTopTracks() {
        let list = (<ul></ul>);
        let tracks = this.state.profile.top_tracks;
        let expandend = this.state.topTracksExpanded;
        if (tracks) {
            if (!expandend) {
                tracks = tracks.slice(0, 5);
            }
            list = (
                <ul className="Top-tracks">
                    {
                        tracks.map((track, i) => (
                        <TrackListItem 
                            key={track.id}
                            token={this.props.token}
                            track={track}
                            index={i + 1}
                            show_artist={true}
                        />
                        ))
                    }
                </ul>
            );
        }
        return list;
    }

    getTopArtists() {
        let list = (<ul></ul>);
        let artists = this.state.profile.top_artists;
        let expandend = this.state.topArtistsExpanded;
        if (artists) {
            if (!expandend) {
                artists = artists.slice(0, 5);
            }
            list = (
                <ul className="Top-artists">
                    {
                        artists.map((artist, i) => (
                            <Link to={'/artist/' + artist.id} key={artist.id}>
                            <li style={{background: `url(${artist.images.length > 0 ? artist.images[1].url : Images.cover})`}}>
                                <h3>{artist.name}</h3>
                            </li>
                            </Link>
                        ))
                    }
                </ul>
            );
        }
        return list;
    }

    componentDidUpdate() {
        if (this.props.match) {
            if (this.props.match.params.user !== this.state.user) {
                this.setState({user: this.props.match.params.user});
                this.getProfile(this.props.match.params.user);
            }
        }
    }

    render() {
        let info = this.state.profile;
        if (info) {
            let profileImg = info.images ? info.images[0].url : Images.profile;
            return (
                <div className="InfoPage ProfileInfo">
                    <div className="Background" 
                        style={{background: `url(${profileImg})`}}>
                    </div>
                    <div className="Info-wrapper">
                        <div className="Profile-image" 
                            style={{background: `url(${profileImg})`}}>
                        </div>
                        <h3 className="Type">{info.display_name ? info.display_name : info.id}</h3>
                        <a href={info.external_urls.spotify} target="_blank">
                            <InfoButton text="Open in Spotify" icon={<SpotifyIcon />} />
                        </a>

                        {this.state.profile.top_tracks ? 
                            <div className="Tracks-wrapper">
                                <h3>Top tracks</h3>
                                {this.getTopTracks()}
                                {
                                    this.state.profile.top_tracks.length > 5 ?
                                        <div className="Expand-button">
                                            <InfoButton
                                                onClick={this.toggleTopTracksExpanded}
                                                text={'Show ' + (this.state.topTracksExpanded ? 'less' : 'more')} />
                                        </div>
                                    : null
                                }
                            </div>
                        :null}

                        {this.state.profile.top_artists ? 
                            <div className="Artists-wrapper">
                                <h3 className="Top-artists-title">Top artists</h3>
                                {this.getTopArtists()}
                                {
                                    this.state.profile.top_artists.length > 5 ?
                                        <div className="Expand-button">
                                            <InfoButton
                                                onClick={this.toggleTopArtistsExpanded}
                                                text={'Show ' + (this.state.topArtistsExpanded ? 'less' : 'more')} />
                                        </div>
                                    : null
                                }
                            </div>
                        :null}

                        <div className="Meta-data">
                            { info.when?
                                <div className="updated">Profile updated: {dateformat(info.when, 'yyyy-mm-dd')}</div>
                            :null}
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return (<div className="InfoPage ProfileInfo">
                {
                    this.state.loading ?
                        <Loading text="Loading profile"/>
                    :
                    <div className="Not-found">
                        <h3 className="Type">Profile not found in JoJk :(</h3>
                        <a href={'https://open.spotify.com/user/' + this.state.user} target="_blank">
                            <InfoButton text="Check on Spotify" icon={<SpotifyIcon />} />
                        </a>
                    </div>
                }
            </div>);
        }
    }

}

export default ProfileInfo;