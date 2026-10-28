// Single source of truth for the KOL wallets the sniper tracks.
// Identity only (label / address / avatar) - no fabricated trade history lives here.
// Consumed by TrackedWalletsFeed (the wallet roster) and LiveSniperFeed (the KOL badge).
export interface KolWallet {
  label: string;
  addr: string;
  img: string;
}

export const TRACKED_WALLETS: KolWallet[] = [
  { label: 'LJC', addr: '6HJetMbdHBuk3mLUainxAPpBpWzDgYbHGTS2TqDAUSX2', img: 'https://kolscan-images.pump.fun/profiles/6HJetMbdHBuk3mLUainxAPpBpWzDgYbHGTS2TqDAUSX2/1788142601320.jpg' },
  { label: 'decu', addr: '4vw54BmAogeRV3vPKWyFet5yf8DTLcREzdSzx4rw9Ud9', img: 'https://kolscan-images.pump.fun/profiles/4vw54BmAogeRV3vPKWyFet5yf8DTLcREzdSzx4rw9Ud9/1788142438185.jpg' },
  { label: 'cented', addr: 'CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o', img: 'https://kolscan-images.pump.fun/profiles/CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o/1788143688269.jpg' },
  { label: 'trunoest', addr: 'ardinRsN1mNYVeoJWTBsWeYeXvuR9UUDGMsCDKpb6AT', img: 'https://kolscan-images.pump.fun/profiles/ardinRsN1mNYVeoJWTBsWeYeXvuR9UUDGMsCDKpb6AT/1788144567863.jpg' },
  { label: 'Mr. Frog', addr: '4DdrfiDHpmx55i4SPssxVzS9ZaKLb8qr45NKY9Er9nNh', img: 'https://kolscan-images.pump.fun/profiles/4DdrfiDHpmx55i4SPssxVzS9ZaKLb8qr45NKY9Er9nNh/1788142112106.jpg' },
  { label: 'Kadenox', addr: 'B32QbbdDAyhvUQzjcaM5j6ZVKwjCxAwGH5Xgvb9SJqnC', img: 'https://kolscan-images.pump.fun/profiles/B32QbbdDAyhvUQzjcaM5j6ZVKwjCxAwGH5Xgvb9SJqnC/1788143339494.jpg' },
  { label: 'theo', addr: 'Bi4rd5FH5bYEN8scZ7wevxNZyNmKHdaBcvewdPFxYdLt', img: 'https://kolscan-images.pump.fun/profiles/Bi4rd5FH5bYEN8scZ7wevxNZyNmKHdaBcvewdPFxYdLt/1788143492795.jpg' },
  { label: 'Dani', addr: 'AuPp4YTMTyqxYXQnHc5KUc6pUuCSsHQpBJhgnD45yqrf', img: 'https://kolscan-images.pump.fun/profiles/AuPp4YTMTyqxYXQnHc5KUc6pUuCSsHQpBJhgnD45yqrf/1788143315929.png' },
  { label: 'Cupsey', addr: '2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f', img: 'https://kolscan-images.pump.fun/profiles/2fg5QD1eD7rzNNCsvnhmXFm5hqNgwTTG8p7kQ6f3rx6f/1788141715685.jpg' },
  { label: 'OGAntD', addr: '215nhcAHjQQGgwpQSJQ7zR26etbjjtVdW74NLzwEgQjP', img: 'https://kolscan-images.pump.fun/profiles/215nhcAHjQQGgwpQSJQ7zR26etbjjtVdW74NLzwEgQjP/1788141623720.jpg' },
  { label: 'Kaaox', addr: '3j5c4aD1aznxQXJ3DWw1b7UD8kKuaqXVbpaVeWPR83TG', img: 'https://kolscan-images.pump.fun/profiles/3j5c4aD1aznxQXJ3DWw1b7UD8kKuaqXVbpaVeWPR83TG/1788141993201.jpg' },
  { label: 'Risk', addr: 'BHREKFkPQgAtDs8Vb1UfLkUpjG6ScidTjHaCWFuG2AtX', img: 'https://kolscan-images.pump.fun/profiles/BHREKFkPQgAtDs8Vb1UfLkUpjG6ScidTjHaCWFuG2AtX/1788143387735.jpg' },
  { label: 'Megga', addr: 'H31vEBxSJk1nQdUN11qZgZyhScyShhscKhvhZZU3dQoU', img: 'https://kolscan-images.pump.fun/profiles/H31vEBxSJk1nQdUN11qZgZyhScyShhscKhvhZZU3dQoU/1788144380906.jpg' },
  { label: 'Hash', addr: 'DNsh1UfJdxmze6T6GV9QK5SoFm7HsM5TRNxVuwVgo8Zj', img: 'https://kolscan-images.pump.fun/profiles/DNsh1UfJdxmze6T6GV9QK5SoFm7HsM5TRNxVuwVgo8Zj/1788143760537.jpg' },
  { label: 'Schoen', addr: '5hAgYC8TJCcEZV7LTXAzkTrm7YL29YXyQQJPCNrG84zM', img: 'https://kolscan-images.pump.fun/profiles/5hAgYC8TJCcEZV7LTXAzkTrm7YL29YXyQQJPCNrG84zM/1788142542800.jpg' },
  { label: 'Ducky', addr: 'ADC1QV9raLnGGDbnWdnsxazeZ4Tsiho4vrWadYswA2ph', img: 'https://kolscan-images.pump.fun/profiles/ADC1QV9raLnGGDbnWdnsxazeZ4Tsiho4vrWadYswA2ph/1788143207231.jpg' },
  { label: 'omar', addr: 'Dgehc8YMv6dHsiPJVoumvq4pSBkMVvrTgTUg7wdcYJPJ', img: 'https://kolscan-images.pump.fun/profiles/Dgehc8YMv6dHsiPJVoumvq4pSBkMVvrTgTUg7wdcYJPJ/1788143856850.jpg' },
  { label: 'danny', addr: 'EaVboaPxFCYanjoNWdkxTbPvt57nhXGu5i6m9m6ZS2kK', img: 'https://kolscan-images.pump.fun/profiles/EaVboaPxFCYanjoNWdkxTbPvt57nhXGu5i6m9m6ZS2kK/1788144028531.jpg' },
  { label: 'ban', addr: 'EqiFgyNw6kgrmYstWyrP8VjKhka7XEmKTZzHSmwpr1Zb', img: 'https://kolscan-images.pump.fun/profiles/EqiFgyNw6kgrmYstWyrP8VjKhka7XEmKTZzHSmwpr1Zb/1788144086357.jpg' },
  { label: 'EustazZ', addr: 'FqamE7xrahg7FEWoByrx1o8SeyHt44rpmE6ZQfT7zrve', img: 'https://kolscan-images.pump.fun/profiles/FqamE7xrahg7FEWoByrx1o8SeyHt44rpmE6ZQfT7zrve/1788144242659.jpg' },
  { label: 'Ethan Prosper', addr: 'sAdNbe1cKNMDqDsa4npB3TfL62T14uAo2MsUQfLvzLT', img: 'https://kolscan-images.pump.fun/profiles/sAdNbe1cKNMDqDsa4npB3TfL62T14uAo2MsUQfLvzLT/1788144638712.jpg' },
  { label: 'zeropnl', addr: '4xY9T1Q7foJzJsJ6YZDSsfp9zkzeZsXnxd45SixduMmr', img: 'https://kolscan-images.pump.fun/profiles/4xY9T1Q7foJzJsJ6YZDSsfp9zkzeZsXnxd45SixduMmr/1788142321381.jpg' },
  { label: 'Pain', addr: 'J6TDXvarvpBdPXTaTU8eJbtso1PUCYKGkVtMKUUY8iEa', img: 'https://kolscan-images.pump.fun/profiles/J6TDXvarvpBdPXTaTU8eJbtso1PUCYKGkVtMKUUY8iEa/1788144472892.jpg' },
  { label: 'LUKEY ✣', addr: 'DjM7Tu7whh6P3pGVBfDzwXAx2zaw51GJWrJE3PwtuN7s', img: 'https://kolscan-images.pump.fun/profiles/DjM7Tu7whh6P3pGVBfDzwXAx2zaw51GJWrJE3PwtuN7s/1788143894778.jpg' },
  { label: 'Flames', addr: '6aXFYXbFob1ZKAEDCcqZnX2vooA3TgEqDoy5dAQbeWoV', img: 'https://kolscan-images.pump.fun/profiles/6aXFYXbFob1ZKAEDCcqZnX2vooA3TgEqDoy5dAQbeWoV/1788142686838.jpg' },
  { label: 'Clown', addr: 'EDXHdSFdadFbYFFjxPXBqMe1kCEDFqpPu552uvp48HR8', img: 'https://kolscan-images.pump.fun/profiles/EDXHdSFdadFbYFFjxPXBqMe1kCEDFqpPu552uvp48HR8/1788143989309.jpg' },
  { label: 'Jijo', addr: '4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk', img: 'https://kolscan-images.pump.fun/profiles/4BdKaxN8G6ka4GYtQQWk4G4dZRUTX2vQH9GcXdBREFUk/1788142088014.jpg' },
  { label: 'Idontpaytaxes', addr: '2T5NgDDidkvhJQg8AHDi74uCFwgp25pYFMRZXBaCUNBH', img: 'https://kolscan-images.pump.fun/profiles/2T5NgDDidkvhJQg8AHDi74uCFwgp25pYFMRZXBaCUNBH/1788141672687.jpg' },
  { label: 'Nikolas (aura arc)', addr: 'iPUp3qkm39ycMGbywWFMUyvaDhiiPGXeWXaDtmHNe6C', img: 'https://kolscan-images.pump.fun/profiles/iPUp3qkm39ycMGbywWFMUyvaDhiiPGXeWXaDtmHNe6C/1788144591562.jpg' },
  { label: 'evening', addr: 'E7gozEiAPNhpJsdS52amhhN2XCAqLZa7WPrhyR6C8o4S', img: 'https://kolscan-images.pump.fun/profiles/E7gozEiAPNhpJsdS52amhhN2XCAqLZa7WPrhyR6C8o4S/1788143963368.jpg' },
  { label: 'Wugi', addr: '862TYSvRYoiHAK3F3WwTRYAfuGiQaGdxedN9AGvRGWo2', img: 'https://kolscan-images.pump.fun/profiles/862TYSvRYoiHAK3F3WwTRYAfuGiQaGdxedN9AGvRGWo2/1788142850677.jpg' },
  { label: 'Latuche', addr: 'GJA1HEbxGnqBhBifH9uQauzXSB53to5rhDrzmKxhSU65', img: 'https://kolscan-images.pump.fun/profiles/GJA1HEbxGnqBhBifH9uQauzXSB53to5rhDrzmKxhSU65/1788144324720.jpg' },
  { label: 'Limfork.eth', addr: 'BQVz7fQ1WsQmSTMY3umdPEPPTm1sdcBcX9sP7o6kPRmB', img: 'https://kolscan-images.pump.fun/profiles/BQVz7fQ1WsQmSTMY3umdPEPPTm1sdcBcX9sP7o6kPRmB/1788143422323.jpg' },
  { label: 'Chairman ²', addr: 'Be24Gbf5KisDk1LcWWZsBn8dvB816By7YzYF5zWZnRR6', img: 'https://kolscan-images.pump.fun/profiles/Be24Gbf5KisDk1LcWWZsBn8dvB816By7YzYF5zWZnRR6/1788143480366.jpg' },
  { label: 'radiance', addr: 'FAicXNV5FVqtfbpn4Zccs71XcfGeyxBSGbqLDyDJZjke', img: 'https://kolscan-images.pump.fun/profiles/FAicXNV5FVqtfbpn4Zccs71XcfGeyxBSGbqLDyDJZjke/1788144152769.jpg' },
  { label: 'Rilsio', addr: '4fZFcK8ms3bFMpo1ACzEUz8bH741fQW4zhAMGd5yZMHu', img: 'https://kolscan-images.pump.fun/profiles/4fZFcK8ms3bFMpo1ACzEUz8bH741fQW4zhAMGd5yZMHu/1788142225351.jpg' },
  { label: 'milito', addr: 'EeXvxkcGqMDZeTaVeawzxm9mbzZwqDUMmfG3bF7uzumH', img: 'https://kolscan-images.pump.fun/profiles/EeXvxkcGqMDZeTaVeawzxm9mbzZwqDUMmfG3bF7uzumH/1788144055936.jpg' },
  { label: 'Lynk', addr: 'CkPFGv2Wv1vwdWjtXioEgb8jhZQfs3eVZez3QCetu7xD', img: 'https://kolscan-images.pump.fun/profiles/CkPFGv2Wv1vwdWjtXioEgb8jhZQfs3eVZez3QCetu7xD/1788143662564.jpg' },
  { label: 'West', addr: 'JDd3hy3gQn2V982mi1zqhNqUw1GfV2UL6g76STojCJPN', img: 'https://kolscan-images.pump.fun/profiles/JDd3hy3gQn2V982mi1zqhNqUw1GfV2UL6g76STojCJPN/1788144519525.jpg' },
  { label: 'peacefuldestroy', addr: '8AtQ4ka3dgtrH1z4Uq3Tm4YdMN3cK5RRj1eKuGNnvenm', img: 'https://kolscan-images.pump.fun/profiles/8AtQ4ka3dgtrH1z4Uq3Tm4YdMN3cK5RRj1eKuGNnvenm/1788142888699.jpg' },
  { label: '0xEthan', addr: '6yVb4pxNwDfr6rovwNnBg3SyKSvDcHGD4WdFPN1JJBqm', img: 'https://kolscan-images.pump.fun/profiles/6yVb4pxNwDfr6rovwNnBg3SyKSvDcHGD4WdFPN1JJBqm/1788142718443.jpg' },
  { label: 'Pengu 💫', addr: 'JAunzNqs3bVBcWDjDxfq9rgLzJMCadNXoaCgfzLGMtYs', img: 'https://kolscan-images.pump.fun/profiles/JAunzNqs3bVBcWDjDxfq9rgLzJMCadNXoaCgfzLGMtYs/1788144486871.jpg' },
  { label: 'Kev', addr: 'BTf4A2exGK9BCVDNzy65b9dUzXgMqB4weVkvTMFQsadd', img: 'https://kolscan-images.pump.fun/profiles/BTf4A2exGK9BCVDNzy65b9dUzXgMqB4weVkvTMFQsadd/1788143434508.jpg' },
  { label: 'Silver', addr: '67Nwfi9hgwqhxGoovT2JGLU67uxfomLwQAWncjXXzU6U', img: 'https://kolscan-images.pump.fun/profiles/67Nwfi9hgwqhxGoovT2JGLU67uxfomLwQAWncjXXzU6U/1788142575825.jpg' },
  { label: 'saale', addr: 'SAALE2x3sn51EyahJyqD6913L3GqHZdZo3egUdMayQp', img: 'https://kolscan-images.pump.fun/profiles/SAALE2x3sn51EyahJyqD6913L3GqHZdZo3egUdMayQp/1788144555579.jpg' },
  { label: 'KOREAN', addr: '6KR7SorsUQtNH6CB6JpAnWCAKeTysa95iyXeWihdNeGT', img: 'https://kolscan-images.pump.fun/profiles/6KR7SorsUQtNH6CB6JpAnWCAKeTysa95iyXeWihdNeGT/1788142667926.jpg' },
  { label: 'The Doc', addr: 'DYAn4XpAkN5mhiXkRB7dGq4Jadnx6XYgu8L5b3WGhbrt', img: 'https://kolscan-images.pump.fun/profiles/DYAn4XpAkN5mhiXkRB7dGq4Jadnx6XYgu8L5b3WGhbrt/1788143807958.jpg' },
  { label: 'Gfree', addr: '4yo9CUuTBbds9NFhZd4MzPiZZkUvveXdTnAH8qMsE8ku', img: 'https://kolscan-images.pump.fun/profiles/4yo9CUuTBbds9NFhZd4MzPiZZkUvveXdTnAH8qMsE8ku/1788142323163.jpg' },
  { label: 'Iced', addr: 'DrJ6SnDXkEsPeGdmSs93v5rwWumv5QMvAGSZjAyWSd5o', img: 'https://kolscan-images.pump.fun/profiles/DrJ6SnDXkEsPeGdmSs93v5rwWumv5QMvAGSZjAyWSd5o/1788143896671.jpg' },
  { label: 'dov 7', addr: '8nqtxpFpuXwfXG4pBLsDkkuMMPK9FjSkBMCn542HiM3v', img: 'https://kolscan-images.pump.fun/profiles/8nqtxpFpuXwfXG4pBLsDkkuMMPK9FjSkBMCn542HiM3v/1788142974074.jpg' },
];

const BY_ADDR = new Map(TRACKED_WALLETS.map((w) => [w.addr, w]));

/** Roster lookup for a trader address; undefined for wallets we do not track. */
export const findKol = (addr?: string | null): KolWallet | undefined =>
  addr ? BY_ADDR.get(addr) : undefined;
