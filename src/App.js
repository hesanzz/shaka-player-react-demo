import React from 'react';
import ShakaPlayer from 'shaka-player-react';
import 'shaka-player/dist/controls.css'
import './App.css';

function App() {
  // const [show, setShow] = React.useState(false);
  const [smilUrl, setSmilUrl] = React.useState('');
  const [pid, updatePid] = React.useState(null);
  const [smilData, updateSmilData] = React.useState(null);
  const [videoUrl, updateUrl] = React.useState('');
  const [sessionToken, setTokken] = React.useState('');

  // function onToggle() {
  //   setShow(!show);
  // }
  const controllerRef = React.useRef(null);

  React.useEffect( () => {
    const url = `https://link.theplatform.com/s/xikYhC/media/x2DkCp0sVrJa?assetTypes=Rendition,Movie&format=SMIL&formats=MPEG-DASH+widevine&tracking=true&auth=${sessionToken}`
    setSmilUrl(url)
  },[sessionToken]);
  
  React.useEffect(() => {
    const { 
      /** @type {shaka.Player} */ player, 
      // /** @type {shaka.ui.Overlay} */ ui,
      /** @type {HTMLVideoElement} */ videoElement,
    } = controllerRef.current;
    
    function loadAsset() {
      player.configure ({
        drm: {
            servers: {
                'com.widevine.alpha': `https://widevine.entitlement.theplatform.com/wv/web/ModularDrm/getRawWidevineLicense?schema=1.0&releasePid=${pid}&token=${sessionToken}&account=http://access.auth.theplatform.com/data/Account/2707572913`,
                'com.microsoft.playready': `https://playready.entitlement.theplatform.com/playready/rightsmanager.asmx?schema=1.0&releasePid=${pid}&auth=${sessionToken}&account=http://access.auth.theplatform.com/data/Account/2707572913`,
            }
        }
      })      
      // Load an asset.
       player.load(videoUrl)
      .then( () => {
        videoElement.play()
      } )
      // Trigger play.

      console.log('playwr', player);
     
    }
    
    loadAsset();
  }, [videoUrl, pid, sessionToken]);

  React.useEffect(() => {
    console.log('smilData', smilData);
    if (!smilData) return
    /* --------------------------------------------- */
    // const isExceptionParam = smilData.querySelector('param[name=\'isException\']')
    // const exceptionParam = smilData.querySelector('param[name=\'exception\']')
    // const responseCodeParam = smilData.querySelector('param[name=\'responseCode\']')
    // const thumbnailUrlTag = smilData.querySelector('imagestream')
    const trackingDataParam = smilData.querySelector('param[name=\'trackingData\']')
    /* --------------------------------------------- */
    // const isException = isExceptionParam && isExceptionParam.getAttribute('value')
    // const exception = exceptionParam && exceptionParam.getAttribute('value')
    // const responseCode = responseCodeParam && responseCodeParam.getAttribute('value')
    // const thumbnailUrl = thumbnailUrlTag && thumbnailUrlTag.getAttribute('src')
    let trackingDataValue = trackingDataParam && trackingDataParam.getAttribute('value')
    trackingDataValue = trackingDataValue && trackingDataValue.split('|')
    let pid = null
    if (trackingDataValue) {
        for (let i = 0; i < trackingDataValue.length; i++) {
            const t = trackingDataValue[i].split('=')
            if (t[0] === 'pid') {
                pid = t[1]; break;
            }
        }
    }
    updatePid(pid)
    const video = smilData.getElementsByTagName('video')[0]
    let videoUrl = video && video.getAttribute('src')
    if (videoUrl) updateUrl(videoUrl)
}, [smilData])

  
  function onPlay() {
    const params = {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*'
      }
    }
    fetch(smilUrl, params).then( response => {
      const contentType = response.headers.get('content-type')
      if (response.status > 299) { 
        // const error = new ServerError(response.statusText)
        // error.status = response.status 
        if (contentType && contentType.includes('application/json')) {
          response.json().then((res) => {
            console.log('res2', res);
            const error = new Error(res.error)
            throw error
          })
          
        } else {
          response.text().then((res) => {
            console.log('res3', res);
            const error = new Error(res.error)
            throw error
          })
        }
      } else {
        if (contentType && contentType.includes('application/json')) {
          response.json().then((res) => {
            const smilParsedData = parseXML(res)
            console.log('smilParsedData', smilParsedData);
            updateSmilData(smilParsedData)
            console.log('responseresponseresponse', res)
          })
        }
        response.text().then((res) => {
          const smilParsedData = parseXML(res)
          console.log('smilParsedData', smilParsedData);
          updateSmilData(smilParsedData)
        })
      }
    })
    console.log('smileDara', smilData);
  }

  // function getSmilUrl(e) {
  //   setSmilUrl(e.target.value)
  // }

  function parseXML (txt) {
    var xmlDoc
    if (window.DOMParser) {
      xmlDoc = new DOMParser().parseFromString(txt, 'text/xml')
    } else { // Internet Explorer
      xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM')
      xmlDoc.async = false
      xmlDoc.loadXML(txt)
    }
  
    return xmlDoc
  }
  return (
    <div className='shaka-app'>
     <div className='data-comp'>
     <div className='shaka-data'>
       <label> Session Token:</label> 
        <input className='input-box' type='text' value={sessionToken} onChange={(e) => setTokken(e.target.value)} />
      </div>
      {/* <div className='shaka-data'>
        <input type='text' value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} />
        <label> Smil url: </label>
        <input className='input-box' type='text' value={smilUrl} onChange={getSmilUrl} />
      </div> */}
     </div>
     
      <div>
        <button onClick={onPlay}> PLAY </button>
        {/* <button onClick={onToggle}>{show ? 'Hide Player' : 'Show Player'}</button> */}
      </div>
      {/* <div>
        <select value={src} onChange={onSelectSrc}>
          {STREAMS.map(stream => (
            <option value={stream.src}>{stream.name}</option>
          ))}
        </select>
      </div> */}
      <ShakaPlayer ref={controllerRef} />
    </div>
  );
}

export default App;
