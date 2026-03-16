import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Circle,
  Path,
  Defs,
  RadialGradient,
  Stop,
  G,
  ClipPath,
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const CX = width / 2;
const CY = height / 2;
const R = Math.min(width, height) * 0.28;

function project(lat, lon, rotDeg) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + rotDeg) * Math.PI) / 180;
  const x = R * Math.sin(phi) * Math.cos(theta);
  const y = R * Math.cos(phi);
  const z = R * Math.sin(phi) * Math.sin(theta);
  return { x: CX + x, y: CY - y, z };
}

function buildPath(points, rotDeg) {
  let d = '';
  let penDown = false;
  for (let i = 0; i < points.length; i++) {
    const [lat, lon] = points[i];
    const p = project(lat, lon, rotDeg);
    if (p.z >= 0) {
      if (!penDown) { d += `M ${p.x.toFixed(1)} ${p.y.toFixed(1)} `; penDown = true; }
      else { d += `L ${p.x.toFixed(1)} ${p.y.toFixed(1)} `; }
    } else { if (penDown) d += 'Z '; penDown = false; }
  }
  if (penDown) d += 'Z';
  return d;
}

function buildGridPaths(rotDeg) {
  const paths = [];
  for (let lat = -80; lat <= 80; lat += 20) {
    let d = ''; let pen = false;
    for (let lon = -180; lon <= 180; lon += 4) {
      const p = project(lat, lon, rotDeg);
      if (p.z >= 0) { d += pen ? `L${p.x.toFixed(1)} ${p.y.toFixed(1)} ` : `M${p.x.toFixed(1)} ${p.y.toFixed(1)} `; pen = true; }
      else { pen = false; }
    }
    if (d) paths.push(d);
  }
  for (let lon = -180; lon < 180; lon += 20) {
    let d = ''; let pen = false;
    for (let lat = -90; lat <= 90; lat += 4) {
      const p = project(lat, lon, rotDeg);
      if (p.z >= 0) { d += pen ? `L${p.x.toFixed(1)} ${p.y.toFixed(1)} ` : `M${p.x.toFixed(1)} ${p.y.toFixed(1)} `; pen = true; }
      else { pen = false; }
    }
    if (d) paths.push(d);
  }
  return paths;
}

const CONTINENTS = [
  [[70,-140],[72,-120],[70,-100],[60,-95],[50,-90],[48,-85],[45,-83],[42,-82],[42,-79],[43,-76],[44,-66],[47,-53],[50,-55],[52,-55],[60,-65],[65,-65],[70,-68],[75,-72],[78,-74],[80,-85],[82,-90],[80,-100],[78,-110],[76,-120],[74,-130],[72,-138],[70,-140]],
  [[30,-118],[32,-117],[32,-115],[28,-110],[24,-110],[22,-106],[20,-105],[18,-103],[16,-95],[15,-90],[16,-88],[15,-85],[13,-85],[10,-83],[9,-80],[8,-77],[8,-75],[10,-73],[12,-72],[15,-70],[18,-66],[18,-67],[20,-65],[22,-70],[24,-77],[26,-80],[28,-80],[30,-81],[32,-80],[34,-78],[36,-76],[38,-75],[40,-74],[41,-71],[42,-70],[44,-68],[45,-67],[47,-65],[46,-60],[48,-53],[50,-55],[52,-58],[50,-65],[48,-70],[47,-75],[45,-75],[43,-76],[42,-79],[42,-82],[45,-83],[48,-85],[50,-90],[60,-95],[70,-100],[72,-120],[70,-140],[60,-142],[55,-130],[50,-125],[45,-124],[40,-124],[35,-121],[32,-118],[30,-118]],
  [[-5,-78],[-1,-78],[2,-77],[5,-77],[8,-75],[10,-73],[12,-72],[10,-62],[8,-60],[6,-60],[4,-52],[2,-50],[0,-50],[-5,-35],[-10,-37],[-15,-39],[-20,-40],[-23,-43],[-25,-48],[-28,-49],[-30,-51],[-33,-52],[-35,-57],[-38,-57],[-40,-62],[-42,-64],[-45,-66],[-48,-65],[-50,-68],[-52,-70],[-54,-68],[-56,-67],[-54,-65],[-52,-68],[-50,-73],[-48,-75],[-46,-74],[-44,-73],[-42,-72],[-40,-71],[-38,-70],[-35,-70],[-30,-71],[-25,-70],[-20,-70],[-18,-70],[-15,-75],[-10,-78],[-5,-78]],
  [[71,28],[70,20],[68,15],[65,14],[63,7],[60,5],[58,5],[55,8],[54,9],[54,11],[52,14],[50,14],[49,18],[48,17],[47,19],[45,19],[44,20],[43,17],[42,20],[40,20],[38,24],[37,22],[36,28],[37,30],[38,26],[40,26],[42,28],[44,29],[46,30],[48,30],[50,30],[52,23],[54,20],[56,22],[58,25],[60,30],[62,27],[64,27],[66,25],[68,28],[70,25],[71,28]],
  [[37,10],[38,15],[37,22],[34,25],[32,32],[30,32],[28,33],[22,37],[15,42],[12,44],[11,42],[8,38],[4,37],[2,42],[0,42],[-5,40],[-10,38],[-15,37],[-20,35],[-25,34],[-30,30],[-34,25],[-35,20],[-34,18],[-30,17],[-25,15],[-20,14],[-15,12],[-10,10],[-5,8],[-1,8],[2,9],[5,2],[5,-5],[4,-10],[2,-10],[2,-15],[5,-13],[8,-15],[10,-17],[12,-16],[14,-17],[16,-15],[18,-12],[20,-12],[22,-15],[25,-15],[28,-12],[30,-10],[32,-7],[33,-8],[35,-12],[37,-12],[38,-8],[38,-5],[40,0],[40,10],[37,10]],
  [[70,30],[68,40],[65,50],[60,60],[55,60],[50,60],[48,55],[45,50],[42,45],[40,45],[38,40],[36,36],[34,36],[32,35],[30,34],[28,34],[26,38],[22,40],[18,42],[15,44],[12,44],[10,44],[8,40],[4,38],[2,38],[0,32],[-2,30],[0,25],[4,20],[8,15],[10,14],[12,12],[15,12],[18,15],[20,18],[22,20],[24,22],[26,22],[28,24],[30,24],[32,22],[34,22],[36,26],[38,28],[40,30],[42,32],[44,30],[46,28],[48,30],[50,32],[52,30],[54,32],[56,38],[58,42],[60,48],[62,52],[64,54],[66,58],[68,60],[70,62],[72,68],[74,72],[72,80],[70,90],[68,100],[65,105],[60,110],[55,110],[50,105],[48,100],[45,88],[42,80],[40,72],[38,65],[36,60],[34,55],[32,50],[30,48],[28,50],[26,56],[24,58],[22,60],[20,58],[18,56],[18,42],[70,30]],
  [[-16,136],[-14,130],[-12,130],[-12,136],[-14,136],[-12,142],[-14,144],[-16,146],[-18,148],[-20,148],[-22,150],[-24,152],[-26,153],[-28,153],[-30,153],[-32,152],[-34,151],[-36,150],[-38,148],[-38,146],[-36,142],[-38,140],[-38,135],[-36,130],[-34,126],[-32,122],[-30,115],[-28,114],[-25,114],[-22,114],[-20,118],[-18,122],[-16,124],[-14,128],[-14,132],[-16,136]],
];

const Dashboard = () => {
  const [rotation, setRotation] = useState(0);
  const animRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    let active = true;
    const tick = (ts) => {
      if (!active) return;
      if (lastRef.current != null) {
        const dt = ts - lastRef.current;
        setRotation((r) => (r + dt * 0.02) % 360);
      }
      lastRef.current = ts;
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { active = false; cancelAnimationFrame(animRef.current); };
  }, []);

  const gridPaths = buildGridPaths(rotation);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="ocean" cx="38%" cy="38%" r="65%">
            <Stop offset="0%" stopColor="#1a6ea8" />
            <Stop offset="50%" stopColor="#0d4f82" />
            <Stop offset="100%" stopColor="#083660" />
          </RadialGradient>
          <RadialGradient id="hl" cx="30%" cy="30%" r="55%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <Stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="shad" cx="72%" cy="68%" r="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </RadialGradient>
          <ClipPath id="gc">
            <Circle cx={CX} cy={CY} r={R} />
          </ClipPath>
        </Defs>

        {/* Ocean */}
        <Circle cx={CX} cy={CY} r={R} fill="url(#ocean)" />

        {/* Clipped globe content */}
        <G clipPath="url(#gc)">
          {/* Grid lines */}
          {gridPaths.map((d, i) => (
            <Path key={`g${i}`} d={d} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} fill="none" />
          ))}
          {/* Continents */}
          {CONTINENTS.map((pts, i) => {
            const d = buildPath(pts, rotation);
            return d ? (
              <Path key={`c${i}`} d={d} fill="rgba(34,197,140,0.75)" stroke="rgba(20,186,156,1)" strokeWidth={0.8} />
            ) : null;
          })}
          {/* Highlight */}
          <Circle cx={CX} cy={CY} r={R} fill="url(#hl)" />
          {/* Shadow */}
          <Circle cx={CX} cy={CY} r={R} fill="url(#shad)" />
        </G>

        {/* Subtle border */}
        <Circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
      </Svg>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});