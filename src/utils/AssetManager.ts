// Import all 29 SVG Assets from src/assets
import cauliflowerFlowerSvg from '../assets/cauliflower_flower.svg';
import coffeeKioskSvg from '../assets/coffee_corner_kiosk.svg';
import compassFrameSvg from '../assets/compass_rose_minimap_frame.svg';
import stationCatSvg from '../assets/cozy_station_cat.svg';
import emptyBenchSvg from '../assets/empty_bench_icon.svg';
import forestFinchSvg from '../assets/forest_finch.svg';
import forestSpiritSvg from '../assets/forest_spirit.svg';
import forestSpiritTopDownSvg from '../assets/forest_spirit_topdown.svg';
import observatoryTowerSvg from '../assets/forgotten_observatory_tower.svg';
import girlSunsetSvg from '../assets/girl_walks_before_sunset.svg';
import girlSunsetSpriteSvg from '../assets/girl_walks_before_sunset_sprite.svg';
import fountainPenSvg from '../assets/glowing_fountain_pen.svg';
import fireflyLanternSvg from '../assets/iron_firefly_lantern.svg';
import meadowBirdsTrioSvg from '../assets/meadow_birds_trio.svg';
import meadowRobinSvg from '../assets/meadow_robin.svg';
import motivationalBookSvg from '../assets/motivational_book.svg';
import arcadeTokenSvg from '../assets/old_arcade_token.svg';
import stationCampfireSvg from '../assets/old_train_station_campfire.svg';
import openNotebookSvg from '../assets/open_notebook_page.svg';
import rainShelterBenchSvg from '../assets/rain_shelter_bench.svg';
import retroArcadeMachineSvg from '../assets/retro_arcade_machine.svg';
import leatherFootballSvg from '../assets/scuffed_leather_football.svg';
import telescopeViewfinderSvg from '../assets/stargazing_telescope_viewfinder.svg';
import starlightBluebirdSvg from '../assets/starlight_bluebird.svg';
import waterfallBridgeSvg from '../assets/starlight_waterfall_bridge.svg';
import coffeeMugSvg from '../assets/tiny_ceramic_coffee_mug.svg';
import chocolateBarSvg from '../assets/tiny_chocolate_bar.svg';
import journalCoverSvg from '../assets/travelers_journal_notebook_cover.svg';
import whisperTreeSvg from '../assets/whisper_tree.svg';

export const SVG_ASSETS = {
  cauliflowerFlower: cauliflowerFlowerSvg,
  coffeeKiosk: coffeeKioskSvg,
  compassFrame: compassFrameSvg,
  stationCat: stationCatSvg,
  emptyBench: emptyBenchSvg,
  forestFinch: forestFinchSvg,
  forestSpirit: forestSpiritSvg,
  forestSpiritTopDown: forestSpiritTopDownSvg,
  observatoryTower: observatoryTowerSvg,
  girlSunset: girlSunsetSvg,
  girlSunsetSprite: girlSunsetSpriteSvg,
  fountainPen: fountainPenSvg,
  fireflyLantern: fireflyLanternSvg,
  meadowBirdsTrio: meadowBirdsTrioSvg,
  meadowRobin: meadowRobinSvg,
  motivationalBook: motivationalBookSvg,
  arcadeToken: arcadeTokenSvg,
  stationCampfire: stationCampfireSvg,
  openNotebook: openNotebookSvg,
  rainShelterBench: rainShelterBenchSvg,
  retroArcadeMachine: retroArcadeMachineSvg,
  leatherFootball: leatherFootballSvg,
  telescopeViewfinder: telescopeViewfinderSvg,
  starlightBluebird: starlightBluebirdSvg,
  waterfallBridge: waterfallBridgeSvg,
  coffeeMug: coffeeMugSvg,
  chocolateBar: chocolateBarSvg,
  journalCover: journalCoverSvg,
  whisperTree: whisperTreeSvg,
};

// Preloaded HTMLImageElement Cache for High-Performance Canvas Rendering
const imageCache: Record<string, HTMLImageElement> = {};

export function preloadSvgImages(): Promise<void> {
  const promises = Object.entries(SVG_ASSETS).map(([key, src]) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        imageCache[key] = img;
        resolve();
      };
      img.onerror = () => {
        resolve(); // Continue gracefully on image load error
      };
      img.src = src;
    });
  });

  return Promise.all(promises).then(() => {});
}

export function getCachedSvgImage(key: keyof typeof SVG_ASSETS): HTMLImageElement | null {
  return imageCache[key] || null;
}
