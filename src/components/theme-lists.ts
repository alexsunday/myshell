import {ITheme} from 'xterm';
const themeLists = require('xterm-theme');

type themeInfo = {
  name: string;
  value: ITheme;
}

export const themes: themeInfo[] = [
  {name: 'Night_3024', value: themeLists.Night_3024},
  {name: 'AdventureTime', value: themeLists.AdventureTime},
  {name: 'Afterglow', value: themeLists.Afterglow},
  {name: 'AlienBlood', value: themeLists.AlienBlood},
  {name: 'Argonaut', value: themeLists.Argonaut},
  {name: 'Arthur', value: themeLists.Arthur},
  {name: 'AtelierSulphurpool', value: themeLists.AtelierSulphurpool},
  {name: 'Atom', value: themeLists.Atom},
  {name: 'Batman', value: themeLists.Batman},
  {name: 'Belafonte_Night', value: themeLists.Belafonte_Night},
  {name: 'BirdsOfParadise', value: themeLists.BirdsOfParadise},
  {name: 'Blazer', value: themeLists.Blazer},
  {name: 'Borland', value: themeLists.Borland},
  {name: 'Bright_Lights', value: themeLists.Bright_Lights},
  {name: 'Broadcast', value: themeLists.Broadcast},
  {name: 'Brogrammer', value: themeLists.Brogrammer},
  {name: 'C64', value: themeLists.C64},
  {name: 'Chalk', value: themeLists.Chalk},
  {name: 'Chalkboard', value: themeLists.Chalkboard},
  {name: 'Ciapre', value: themeLists.Ciapre},
  {name: 'Cobalt2', value: themeLists.Cobalt2},
  {name: 'Cobalt_Neon', value: themeLists.Cobalt_Neon},
  {name: 'CrayonPonyFish', value: themeLists.CrayonPonyFish},
  {name: 'Dark_Pastel', value: themeLists.Dark_Pastel},
  {name: 'Darkside', value: themeLists.Darkside},
  {name: 'Desert', value: themeLists.Desert},
  {name: 'DimmedMonokai', value: themeLists.DimmedMonokai},
  {name: 'DotGov', value: themeLists.DotGov},
  {name: 'Dracula', value: themeLists.Dracula},
  {name: 'Duotone_Dark', value: themeLists.Duotone_Dark},
  {name: 'ENCOM', value: themeLists.ENCOM},
  {name: 'Earthsong', value: themeLists.Earthsong},
  {name: 'Elemental', value: themeLists.Elemental},
  {name: 'Elementary', value: themeLists.Elementary},
  {name: 'Espresso', value: themeLists.Espresso},
  {name: 'Espresso_Libre', value: themeLists.Espresso_Libre},
  {name: 'Fideloper', value: themeLists.Fideloper},
  {name: 'FirefoxDev', value: themeLists.FirefoxDev},
  {name: 'Firewatch', value: themeLists.Firewatch},
  {name: 'FishTank', value: themeLists.FishTank},
  {name: 'Flat', value: themeLists.Flat},
  {name: 'Flatland', value: themeLists.Flatland},
  {name: 'Floraverse', value: themeLists.Floraverse},
  {name: 'ForestBlue', value: themeLists.ForestBlue},
  {name: 'FrontEndDelight', value: themeLists.FrontEndDelight},
  {name: 'FunForrest', value: themeLists.FunForrest},
  {name: 'Galaxy', value: themeLists.Galaxy},
  {name: 'Github', value: themeLists.Github},
  {name: 'Glacier', value: themeLists.Glacier},
  {name: 'Grape', value: themeLists.Grape},
  {name: 'Grass', value: themeLists.Grass},
  {name: 'Gruvbox_Dark', value: themeLists.Gruvbox_Dark},
  {name: 'Hardcore', value: themeLists.Hardcore},
  {name: 'Harper', value: themeLists.Harper},
  {name: 'Highway', value: themeLists.Highway},
  {name: 'Hipster_Green', value: themeLists.Hipster_Green},
  {name: 'Homebrew', value: themeLists.Homebrew},
  {name: 'Hurtado', value: themeLists.Hurtado},
  {name: 'Hybrid', value: themeLists.Hybrid},
  {name: 'IC_Green_PPL', value: themeLists.IC_Green_PPL},
  {name: 'IC_Orange_PPL', value: themeLists.IC_Orange_PPL},
  {name: 'IR_Black', value: themeLists.IR_Black},
  {name: 'Jackie_Brown', value: themeLists.Jackie_Brown},
  {name: 'Japanesque', value: themeLists.Japanesque},
  {name: 'Jellybeans', value: themeLists.Jellybeans},
  {name: 'JetBrains_Darcula', value: themeLists.JetBrains_Darcula},
  {name: 'Kibble', value: themeLists.Kibble},
  {name: 'Later_This_Evening', value: themeLists.Later_This_Evening},
  {name: 'Lavandula', value: themeLists.Lavandula},
  {name: 'LiquidCarbon', value: themeLists.LiquidCarbon},
  {name: 'LiquidCarbonTransparent', value: themeLists.LiquidCarbonTransparent},
  {name: 'LiquidCarbonTransparentInverse', value: themeLists.LiquidCarbonTransparentInverse},
  {name: 'Man_Page', value: themeLists.Man_Page},
  {name: 'Material', value: themeLists.Material},
  {name: 'MaterialDark', value: themeLists.MaterialDark},
  {name: 'Mathias', value: themeLists.Mathias},
  {name: 'Medallion', value: themeLists.Medallion},
  {name: 'Misterioso', value: themeLists.Misterioso},
  {name: 'Molokai', value: themeLists.Molokai},
  {name: 'MonaLisa', value: themeLists.MonaLisa},
  {name: 'Monokai_Soda', value: themeLists.Monokai_Soda},
  {name: 'Monokai_Vivid', value: themeLists.Monokai_Vivid},
  {name: 'N0tch2k', value: themeLists.N0tch2k},
  {name: 'Neopolitan', value: themeLists.Neopolitan},
  {name: 'Neutron', value: themeLists.Neutron},
  {name: 'NightLion_v1', value: themeLists.NightLion_v1},
  {name: 'NightLion_v2', value: themeLists.NightLion_v2},
  {name: 'Novel', value: themeLists.Novel},
  {name: 'Obsidian', value: themeLists.Obsidian},
  {name: 'Ocean', value: themeLists.Ocean},
  {name: 'OceanicMaterial', value: themeLists.OceanicMaterial},
  {name: 'Ollie', value: themeLists.Ollie},
  {name: 'OneHalfDark', value: themeLists.OneHalfDark},
  {name: 'OneHalfLight', value: themeLists.OneHalfLight},
  {name: 'Pandora', value: themeLists.Pandora},
  {name: 'Paraiso_Dark', value: themeLists.Paraiso_Dark},
  {name: 'Parasio_Dark', value: themeLists.Parasio_Dark},
  {name: 'PaulMillr', value: themeLists.PaulMillr},
  {name: 'PencilDark', value: themeLists.PencilDark},
  {name: 'PencilLight', value: themeLists.PencilLight},
  {name: 'Piatto_Light', value: themeLists.Piatto_Light},
  {name: 'Pnevma', value: themeLists.Pnevma},
  {name: 'Pro', value: themeLists.Pro},
  {name: 'Red_Alert', value: themeLists.Red_Alert},
  {name: 'Red_Sands', value: themeLists.Red_Sands},
  {name: 'Rippedcasts', value: themeLists.Rippedcasts},
  {name: 'Royal', value: themeLists.Royal},
  {name: 'Ryuuko', value: themeLists.Ryuuko},
  {name: 'SeaShells', value: themeLists.SeaShells},
  {name: 'Seafoam_Pastel', value: themeLists.Seafoam_Pastel},
  {name: 'Seti', value: themeLists.Seti},
  {name: 'Shaman', value: themeLists.Shaman},
  {name: 'Slate', value: themeLists.Slate},
  {name: 'Smyck', value: themeLists.Smyck},
  {name: 'SoftServer', value: themeLists.SoftServer},
  {name: 'Solarized_Darcula', value: themeLists.Solarized_Darcula},
  {name: 'Solarized_Dark', value: themeLists.Solarized_Dark},
  {name: 'Solarized_Dark_Patched', value: themeLists.Solarized_Dark_Patched},
  {name: 'Solarized_Dark_Higher_Contrast', value: themeLists.Solarized_Dark_Higher_Contrast},
  {name: 'Solarized_Light', value: themeLists.Solarized_Light},
  {name: 'SpaceGray', value: themeLists.SpaceGray},
  {name: 'SpaceGray_Eighties', value: themeLists.SpaceGray_Eighties},
  {name: 'SpaceGray_Eighties_Dull', value: themeLists.SpaceGray_Eighties_Dull},
  {name: 'Spacedust', value: themeLists.Spacedust},
  {name: 'Spiderman', value: themeLists.Spiderman},
  {name: 'Spring', value: themeLists.Spring},
  {name: 'Square', value: themeLists.Square},
  {name: 'Sundried', value: themeLists.Sundried},
  {name: 'Symfonic', value: themeLists.Symfonic},
  {name: 'Teerb', value: themeLists.Teerb},
  {name: 'Terminal_Basic', value: themeLists.Terminal_Basic},
  {name: 'Thayer_Bright', value: themeLists.Thayer_Bright},
  {name: 'The_Hulk', value: themeLists.The_Hulk},
  {name: 'Tomorrow', value: themeLists.Tomorrow},
  {name: 'Tomorrow_Night', value: themeLists.Tomorrow_Night},
  {name: 'Tomorrow_Night_Blue', value: themeLists.Tomorrow_Night_Blue},
  {name: 'Tomorrow_Night_Bright', value: themeLists.Tomorrow_Night_Bright},
  {name: 'Tomorrow_Night_Eighties', value: themeLists.Tomorrow_Night_Eighties},
  {name: 'ToyChest', value: themeLists.ToyChest},
  {name: 'Treehouse', value: themeLists.Treehouse},
  {name: 'Ubuntu', value: themeLists.Ubuntu},
  {name: 'UnderTheSea', value: themeLists.UnderTheSea},
  {name: 'Urple', value: themeLists.Urple},
  {name: 'Vaughn', value: themeLists.Vaughn},
  {name: 'VibrantInk', value: themeLists.VibrantInk},
  {name: 'Violet_Dark', value: themeLists.Violet_Dark},
  {name: 'Violet_Light', value: themeLists.Violet_Light},
  {name: 'WarmNeon', value: themeLists.WarmNeon},
  {name: 'Wez', value: themeLists.Wez},
  {name: 'WildCherry', value: themeLists.WildCherry},
  {name: 'Wombat', value: themeLists.Wombat},
  {name: 'Wryan', value: themeLists.Wryan},
  {name: 'Zenburn', value: themeLists.Zenburn},
  {name: 'ayu', value: themeLists.ayu},
  {name: 'deep', value: themeLists.deep},
  {name: 'idleToes', value: themeLists.idleToes},
];
