import {ssbSets} from "./random-teams";
import {changeSet, getName} from "./scripts";
import {Teams} from '../../../sim/teams';

export const Moves: {[k: string]: ModdedMoveData} = {
	/*
	// Example
	moveid: {
		accuracy: 100, // a number or true for always hits
		basePower: 100, // Not used for Status moves, base power of the move, number
		category: "Physical", // "Physical", "Special", or "Status"
		desc: "", // long description
		shortDesc: "", // short description, shows up in /dt
		name: "Move Name",
		gen: 8,
		pp: 10, // unboosted PP count
		priority: 0, // move priority, -6 -> 6
		flags: {}, // Move flags https://github.com/smogon/pokemon-showdown/blob/master/data/moves.js#L1-L27
		onTryMove() {
			this.attrLastMove('[still]'); // For custom animations
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Move Name 1', source);
			this.add('-anim', source, 'Move Name 2', source);
		}, // For custom animations
		secondary: {
			status: "tox",
			chance: 20,
		}, // secondary, set to null to not use one. Exact usage varies, check data/moves.js for examples
		target: "normal", // What does this move hit?
		// normal = the targeted foe, self = the user, allySide = your side (eg light screen), foeSide = the foe's side (eg spikes), all = the field (eg raindance). More can be found in data/moves.js
		type: "Water", // The move's type
		// Other useful things
		noPPBoosts: true, // add this to not boost the PP of a move, not needed for Z moves, dont include it otherwise
		isZ: "crystalname", // marks a move as a z move, list the crystal name inside
		zMove: {effect: ''}, // for status moves, what happens when this is used as a Z move? check data/moves.js for examples
		zMove: {boost: {atk: 2}}, // for status moves, stat boost given when used as a z move
		critRatio: 2, // The higher the number (above 1) the higher the ratio, lowering it lowers the crit ratio
		drain: [1, 2], // recover first num / second num % of the damage dealt
		heal: [1, 2], // recover first num / second num % of the target's HP
	},
	*/
	// Please keep sets organized alphabetically based on staff member name!
	// Aeonic
	memesthatburnthesky: {
		accuracy: 100,
		basePower: 140,
		category: "Special",
		shortDesc: "No additional effect.",
		name: "Memes That Burn The Sky",
		gen: 9,
		pp: 5,
		priority: 0,
		flags: {protect: 1, recharge: 1, mirror: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Light That Burns The Sky', target);
			this.add('-anim', source, 'Rock Wrecker', target);
		},
		secondary: null,
		target: "normal",
		type: "Rock",
	},

	// A Quag To The Past
	sireswitch: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Quag: Protect; Clod: Recover. Switch to other sire.",
		name: "Sire Switch",
		gen: 9,
		pp: 20,
		priority: 4,
		onModifyPriority(relayVar, source, target, move) {
			if (source.species.name === 'Clodsire') {
				return -6;
			}
		},
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Max Guard', source);
			if (source.species.name === 'Quagsire') {
				this.add('-anim', source, 'Protect', source);
				return !!this.queue.willAct() && this.runEvent('StallMove', source);
			} else {
				this.add('-anim', source, 'Recover', source);
			}
		},
		volatileStatus: 'protect',
		onModifyMove(move, pokemon) {
			if (pokemon.species.name === 'Clodsire') {
				move.heal = [1, 2];
				delete move.volatileStatus;
			}
		},
		onHit(pokemon) {
			if (pokemon.species.name === 'Quagsire') {
				pokemon.addVolatile('stall');
				changeSet(this, pokemon, ssbSets['A Quag To The Past-Clodsire'], true);
			} else {
				changeSet(this, pokemon, ssbSets['A Quag To The Past'], true);
			}
		},
		secondary: null,
		target: "self",
		type: "Ground",
	},

	// BreadLoeuf
	bakersdouzeoff: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "User wakes up, then switches out.",
		name: "Baker's Douze Off",
		gen: 9,
		pp: 15,
		priority: 0,
		flags: {},
		sleepUsable: true,
		onTry(pokemon) {
			return !!this.canSwitch(pokemon.side);
		},
		onPrepareHit(pokemon) {
			this.attrLastMove('[anim] Teleport');
			if (pokemon.status === 'slp') pokemon.cureStatus();
		},
		selfSwitch: true,
		secondary: null,
		target: "self",
		type: "Normal",
	},

	// Cake
	shawn: {
		accuracy: 97,
		basePower: 71,
		category: "Physical",
		shortDesc: "Force switch if newly switched. 2x BP vs Magic Guard and HDB.",
		name: "Shawn",
		gen: 9,
		pp: 10,
		priority: -6,
		flags: {protect: 1, mirror: 1},
		onTryMove() {
			this.attrLastMove('[anim] Circle Throw');
		},
		basePowerCallback(pokemon, target, move) {
			if (target.hasAbility('magicguard') || target.hasItem('heavydutyboots')) {
				return move.basePower * 2;
			}
			return move.basePower;
		},
		onModifyMove(move, source, target) {
			if (target?.newlySwitched || !!target?.positiveBoosts()) move.forceSwitch = true;
		},
		onModifyType(move) {
			this.debug('THIS THING MUST NOT CRASH');
			move.type = '???';
		},
		onMoveFail(target, source) {
			source.forceSwitchFlag = true;
		},
		secondary: null,
		target: "normal",
		type: "Bird",
	},

	// Coolcodename
	haxerswill: {
		accuracy: 100,
		basePower: 0,
		category: "Status",
		shortDesc: "70% boost Spa/Spe by 1 & Focus Energy, else lose boosts.",
		name: "Haxer's Will",
		gen: 9,
		pp: 15,
		priority: 0,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Clangorous Soul', source);
			this.add('-anim', source, 'Focus Energy', source);
		},
		onHit(pokemon) {
			if (this.randomChance(7, 10)) {
				this.boost({spa: 1, spe: 1});
				pokemon.addVolatile('focusenergy');
			} else {
				pokemon.clearBoosts();
				this.add('-clearboost', pokemon);
			}
		},
		target: "self",
		type: "Normal",
	},

	// deftinwolf
	trivialpursuit: {
		accuracy: 100,
		basePower: 70,
		basePowerCallback(pokemon, target, move) {
			// You can't get here unless the pursuit succeeds
			if (target.beingCalledBack || target.switchFlag) {
				this.debug('Trivial Pursuit damage boost');
				return move.basePower * 2;
			}
			return move.basePower;
		},
		category: "Physical",
		shortDesc: "If foe is switching out, 2x power. Doesn't KO.",
		name: "Trivial Pursuit",
		pp: 5,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		onPrepareHit() {
			this.attrLastMove('[anim] Pursuit');
		},
		beforeTurnCallback(pokemon) {
			for (const side of this.sides) {
				if (side.hasAlly(pokemon)) continue;
				side.addSideCondition('trivialpursuit', pokemon);
				const data = side.getSideConditionData('trivialpursuit');
				if (!data.sources) {
					data.sources = [];
				}
				data.sources.push(pokemon);
			}
		},
		onModifyMove(move, source, target) {
			if (target?.beingCalledBack || target?.switchFlag) move.accuracy = true;
		},
		onTryHit(target, pokemon) {
			target.side.removeSideCondition('trivialpursuit');
		},
		condition: {
			duration: 1,
			onBeforeSwitchOut(pokemon) {
				this.debug('Trivial Pursuit start');
				let alreadyAdded = false;
				pokemon.removeVolatile('destinybond');
				for (const source of this.effectState.sources) {
					if (!source.isAdjacent(pokemon) || !this.queue.cancelMove(source) || !source.hp) continue;
					if (!alreadyAdded) {
						this.add('-activate', pokemon, 'move: Trivial Pursuit');
						alreadyAdded = true;
					}
					// Run through each action in queue to check if the Pursuit user is supposed to Mega Evolve this turn.
					// If it is, then Mega Evolve before moving.
					if (source.canMegaEvo || source.canUltraBurst) {
						for (const [actionIndex, action] of this.queue.entries()) {
							if (action.pokemon === source && action.choice === 'megaEvo') {
								this.actions.runMegaEvo(source);
								this.queue.list.splice(actionIndex, 1);
								break;
							}
						}
					}
					this.actions.runMove('trivialpursuit', source, source.getLocOf(pokemon));
				}
			},
		},
		onDamagePriority: -20,
		onDamage(damage, target, source, effect) {
			if (damage >= target.hp) return target.hp - 1;
		},
		secondary: null,
		target: "normal",
		type: "Dark",
	},

	// Eli
	sustainedwinds: {
		accuracy: 90,
		basePower: 20,
		category: "Special",
		shortDesc: "Hits 5x. Heals 20% of damage dealt on each hit.",
		name: "Sustained Winds",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1, heal: 1, wind: 1},
		onPrepareHit() {
			this.attrLastMove('[anim] Bleakwind Storm');
		},
		drain: [1, 5],
		multihit: 5,
		secondary: null,
		target: 'normal',
		type: "Flying",
	},

	// havi
	augurofebrietas: {
		accuracy: 100,
		basePower: 70,
		category: "Special",
		shortDesc: "Disables the target's last move and pivots out.",
		name: "Augur of Ebrietas",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onPrepareHit() {
			this.attrLastMove('[anim] Spirit Shackle');
		},
		selfSwitch: true,
		volatileStatus: 'disable',
		target: "normal",
		type: "Ghost",
	},

	// hsy
	wonderwing: {
		accuracy: 90,
		basePower: 150,
		category: "Physical",
		shortDesc: "No dmg rest of turn. Next turn user moves -1 prio.",
		name: "Wonder Wing",
		pp: 5,
		priority: -1,
		flags: {contact: 1},
		// No negative contact effects implemented in Battle#checkMovesMakeContact
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Electric Terrain', source);
			this.add('-anim', source, 'Giga Impact', target);
		},
		self: {
			volatileStatus: 'wonderwing',
		},
		condition: {
			noCopy: true,
			duration: 2,
			onStart(pokemon) {
				this.add('-start', pokemon, 'Wonder Wing');
			},
			onRestart(target, source, sourceEffect) {
				target.removeVolatile('wonderwing');
			},
			onDamage(damage, target, source, effect) {
				if (this.effectState.duration < 2) return;
				this.add('-activate', source, 'move: Wonder Wing');
				return false;
			},
			onModifyPriority(relayVar, source, target, move) {
				return -1;
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Wonder Wing', '[silent]');
			},
		},
		target: "normal",
		type: "Flying",

	},

	// in the hills
	"102040": {
		accuracy: 100,
		basePower: 10,
		category: "Physical",
		name: "10-20-40",
		shortDesc: "Hits 3 times, 3rd hit always crits. sets Safeguard.",
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		basePowerCallback(pokemon, target, move) {
			return [10, 20, 40][move.hit - 1];
		},
		onTryHit(target, source, move) {
			if (move.hit === 3) {
				move.willCrit = true;
			}
		},
		onPrepareHit() {
			this.attrLastMove('[anim] Triple Kick');
		},
		self: {
			sideCondition: 'safeguard',
		},
		secondary: null,
		multihit: 3,
		target: "normal",
		type: "Ground",
	},

	// ironwater
	jirachibanhammer: {
		accuracy: 100,
		basePower: 120,
		category: "Physical",
		shortDesc: "Prevents the target from switching out.",
		name: "Jirachi Ban Hammer",
		pp: 5,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		onPrepareHit() {
			this.attrLastMove('[anim] Gigaton Hammer');
		},
		secondary: {
			chance: 100,
			onHit(target, source, move) {
				if (source.isActive) target.addVolatile('trapped', source, move, 'trapper');
			},
		},
		target: "normal",
		type: "Steel",
	},

	// Irpachuza
	bibbidibobbidirands: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Changes target to a Randbats set.",
		name: "Bibbidi-Bobbidi-Rands",
		gen: 9,
		pp: 1,
		priority: 0,
		flags: {protect: 1},
		onPrepareHit(target, source) {
			this.attrLastMove('[anim] Doom Desire');
		},
		onHit(target) {
			const formats = ['gen9randombattle', 'gen9hackmonscup', 'gen9challengecup', 'gen9computergeneratedteams'];
			const randFormat = this.sample(formats);
			let msg;
			switch (randFormat) {
			case 'gen9randombattle':
				msg = "Ta-dah! You are now blessed with a set from the most popular format on the sim, hope you like it! n.n";
				break;
			case 'gen9hackmonscup':
				msg = "Hackmons Cup is like Rands but scrambled eggs, cheese and pasta. I'm sure you'll love it too n.n";
				break;
			case 'gen9challengecup':
				msg = "The only difference between a Challenge Cup Pokémon and my in-game one is that the former actually surpassed lvl. 60, enjoy n.n";
				break;
			case 'gen9computergeneratedteams':
				msg = "We asked an AI to make a randbats set. YOU WON'T BELIEVE WHAT IT CAME UP WITH N.N";
				break;
			}
			// TODO: ban mons with custom stats
			const team = Teams.generate(randFormat, {name: target.side.name});
			this.addMove('-anim', target, 'Wish', target);
			// @ts-ignore set wants a sig but randbats sets don't have one
			changeSet(this, target, team[0], true);
			this.add(`c:|${getName('Irpachuza!')}|${msg}`);
		},
		isZ: "irpatuziniumz",
		secondary: null,
		target: "normal",
		type: "Fairy",
	},

	// Kennedy
	hattrick: {
		accuracy: 98,
		basePower: 19,
		category: "Physical",
		shortDesc: "3 hits. Last always crits. 3.5% chance to curse.",
		name: "Hat-Trick",
		gen: 9,
		pp: 10,
		priority: 0,
		flags: {contact: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Focus Energy', source);
			this.add('-anim', source, 'High Jump Kick', target);
			this.add('-anim', target, 'Boomburst', source);
			this.add('-anim', source, 'Aqua Step', target);
			this.add('-anim', source, 'Aqua Step', target);
		},
		onTryHit(target, source, move) {
			if (move.hit === 3) {
				move.willCrit = true;
			}
		},
		secondary: {
			chance: 3.5,
			volatileStatus: 'curse',
		},
		multihit: 3,
		target: "normal",
		type: "Ice",
	},
	anfieldatmosphere: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Anfield Atmosphere",
		pp: 5,
		priority: 0,
		flags: {mirror: 1},
		pseudoWeather: 'anfieldatmosphere',
		condition: {
			duration: 6,
			durationCallback(source, effect) {
				if (source?.hasAbility('persistent')) {
					this.add('-activate', source, 'ability: Persistent', '[move] Anfield Atmosphere');
					return 8;
				}
				return 6;
			},
			onFieldStart(target, source) {
				if (source?.hasAbility('persistent')) {
					this.add('-fieldstart', 'move: Anfield Atmosphere', '[of] ' + source, '[persistent]');
				} else {
					this.add('-fieldstart', 'move: Anfield Atmosphere', '[of] ' + source);
				}
			},
			onFieldRestart(target, source) {
				this.field.removePseudoWeather('anfieldatmosphere');
			},
			onAnySetWeather(target, source, weather) {
				return false;
			},
			onSetStatus(status, target, source, effect) {
				if (effect.id === 'anfieldatmosphere') return;
				if (status.id === 'slp' && !target.isSemiInvulnerable()) {
					this.add('-activate', target, 'move: Anfield Atmosphere');
					return false;
				}
				for (const pokemon of this.getAllActive()) {
					if (!pokemon.hp || pokemon.fainted) continue;
					pokemon.trySetStatus(status, source, this.effect);
				}
			},
			onTryAddVolatile(status, target) {
				if (target.isSemiInvulnerable()) return;
				if (status.id === 'yawn') {
					this.add('-activate', target, 'move: Anfield Atmosphere');
					return null;
				}
			},
			onDamage(damage, target, source, effect) {
				if (effect && ['stealthrock', 'spikes', 'gmaxsteelsurge'].includes(effect.id)) {
					return damage / 2;
				}
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 1,
			onFieldEnd() {
				this.add('-fieldend', 'move: Anfield Atmosphere');
			},
		},
		secondary: null,
		target: "all",
		type: "Psychic",
	},

	// Kolochu
	hangten: {
		accuracy: 100,
		basePower: 75,
		category: "Special",
		name: "Hang Ten",
		shortDesc: "User sets Electric Terrain on hit.",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Stoked Sparksurfer', target);
			this.add('-anim', source, 'Surf', target);
		},
		secondary: {
			chance: 100,
			self: {
				onHit() {
					this.field.setTerrain('electricterrain');
				},
			},
		},
		target: "normal",
		type: "Water",
	},

	// Kris
	ok: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "20% Atk -> SpA/Spe; else SpA boosts -> other stats.",
		name: "ok",
		gen: 9,
		pp: 15,
		priority: 4,
		flags: {},
		stallingMove: true,
		volatileStatus: 'protect',
		// TODO move anims
		onPrepareHit(pokemon) {
			return !!this.queue.willAct() && this.runEvent('StallMove', pokemon);
		},
		onHit(pokemon) {
			pokemon.addVolatile('stall');
			if (this.random(100) > 20) {
				if (!pokemon.boosts['spa'] || pokemon.boosts['spa'] < 0) return null;
				const spaBoosts = pokemon.boosts['spa'];
				let modifiableSpaBoosts = spaBoosts;
				const randomStat: SparseBoostsTable = {};
				while (modifiableSpaBoosts > 0) {
					const randomStatID: BoostID = this.sample(['atk', 'def', 'spd', 'spe']);
					if (!randomStat[randomStatID]) randomStat[randomStatID] = 0;
					randomStat[randomStatID]! += 1;
					modifiableSpaBoosts -= 1;
				}
				this.boost({spa: -spaBoosts, ...randomStat}, pokemon, pokemon, this.effect);
			} else {
				if (!pokemon.volatiles['ok']) pokemon.addVolatile('ok');
			}
		},
		condition: {
			noCopy: true,
			onStart(pokemon) {
				this.add('-start', pokemon, 'ok');
				this.effectState.atk = pokemon.storedStats.atk;
				this.effectState.spa = pokemon.storedStats.spa;
				this.effectState.spe = pokemon.storedStats.spe;
				pokemon.storedStats.spa = Math.floor(pokemon.storedStats.atk / 10) + pokemon.storedStats.spa;
				pokemon.storedStats.spe = Math.floor(pokemon.storedStats.atk * 9 / 10) + pokemon.storedStats.spe;
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'ok');
				pokemon.storedStats.spa = this.effectState.spa;
				pokemon.storedStats.spe = this.effectState.spe;
			},
			onRestart(pokemon) {
				pokemon.removeVolatile('ok');
			},
		},
		secondary: null,
		target: "self",
		type: "Fairy",
	},
	// Krytocon
	attackofopportunity: {
		accuracy: 100,
		basePower: 60,
		basePowerCallback(pokemon, target, move) {
			if (target.beingCalledBack || target.switchFlag) {
				this.debug('Attack of Opportunity damage boost');
				return move.basePower * 2;
			}
			return move.basePower;
		},
		category: "Physical",
		shortDesc: "Power: x2 if opponent switches out. Damages on switch-out. +2 Attack on switch KO.",
		name: "Attack of Opportunity",
		pp: 20,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Behemoth Blade', target);
		},
		beforeTurnCallback(pokemon) {
			for (const side of this.sides) {
				if (side.hasAlly(pokemon)) continue;
				side.addSideCondition('attackofopportunity', pokemon);
				const data = side.getSideConditionData('attackofopportunity');
				if (!data.sources) {
					data.sources = [];
				}
				data.sources.push(pokemon);
			}
		},
		onModifyMove(move, source, target) {
			if (target?.beingCalledBack || target?.switchFlag) move.accuracy = true;
		},
		onTryHit(target, pokemon) {
			target.side.removeSideCondition('attackofopportunity');
		},
		condition: {
			duration: 1,
			onBeforeSwitchOut(pokemon) {
				this.debug('Attack of Opportunity start');
				let alreadyAdded = false;
				pokemon.removeVolatile('destinybond');
				for (const source of this.effectState.sources) {
					if (!source.isAdjacent(pokemon) || !this.queue.cancelMove(source) || !source.hp) continue;
					if (!alreadyAdded) {
						this.add('-activate', pokemon, 'move: Attack of Opportunity');
						alreadyAdded = true;
					}
					if (source.canMegaEvo) {
						for (const [actionIndex, action] of this.queue.entries()) {
							if (action.pokemon === source && action.choice === 'megaEvo') {
								this.actions.runMegaEvo(source);
								this.queue.list.splice(actionIndex, 1);
								break;
							}
						}
					}
					this.actions.runMove('attackofopportunity', source, source.getLocOf(pokemon));
				}
			},
		},
		onAfterMoveSecondarySelf(pokemon, target, move) {
			if (!target || target.fainted || target.hp <= 0 ||
				target.beingCalledBack || target.switchFlag) {
				this.boost({atk: 2}, pokemon, pokemon, move);
			}
		},
		secondary: null,
		target: "normal",
		type: "Steel",
		contestType: "Clever",
	},

	// Lumari
	mysticalbonfire: {
		accuracy: 100,
		basePower: 60,
		basePowerCallback(pokemon, target, move) {
			if (target.status || target.hasAbility('comatose')) return move.basePower * 2;
			return move.basePower;
		},
		category: "Physical",
		shortDesc: "30% burn. 2x power if target is already statused.",
		name: "Mystical Bonfire",
		pp: 15,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Infernal Parade', target);
			this.add('-anim', source, 'Fury Attack', target);
		},
		secondary: {
			chance: 30,
			status: 'brn',
		},
		target: "normal",
		type: "Psychic",
	},

	// Mad Monty
	stormshelter: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Storm Shelter",
		shortDesc: "User protects and sets up a substitute.",
		pp: 5,
		priority: 4,
		flags: {},
		stallingMove: true,
		volatileStatus: 'protect',
		onPrepareHit(pokemon) {
			this.attrLastMove('[anim] Protect');
			return !!this.queue.willAct() && this.runEvent('StallMove', pokemon);
		},
		onHit(pokemon) {
			pokemon.addVolatile('stall');
			if (!pokemon.volatiles['substitute']) {
				if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.maxhp === 1) { // Shedinja clause
					this.add('-fail', pokemon, 'move: Substitute', '[weak]');
				} else {
					pokemon.addVolatile('substitute');
					this.directDamage(pokemon.maxhp / 4);
				}
			}
			if (!Object.values(pokemon.boosts).some(x => x >= 6)) {
				this.boost({atk: 1, def: 1, spa: 1, spd: 1, spe: 1, accuracy: 1, evasion: 1}, pokemon);
				this.add(`c:|${getName('Mad Monty')}|Ope! Wrong button, sorry.`);
				this.boost({atk: -1, def: -1, spa: -1, spd: -1, spe: -1, accuracy: -1, evasion: -1}, pokemon);
			}
		},
		secondary: null,
		target: "self",
		type: "Normal",
	},

	// Mathy
	breakingchange: {
		accuracy: 100,
		basePower: 70,
		category: "Physical",
		shortDesc: "Ignores target's Ability; disables it on hit.",
		name: "Breaking Change",
		gen: 9,
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onPrepareHit() {
			this.attrLastMove('[anim] Salt Cure');
		},
		onHit(target) {
			if (target.getAbility().isPermanent) return;
			if (!target.addVolatile('gastroacid')) return;
			this.add(`c:|${getName('Mathy')}|Sorry i tried to fix smth but accidentally broke your ability :( will fix it next week`);
		},
		ignoreAbility: true,
		secondary: null,
		target: "normal",
		type: "Normal",
	},

	// Mex
	timeskip: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Time Skip",
		shortDesc: "Clears hazards. +10 turns.",
		pp: 10,
		priority: 0,
		flags: {},
		onPrepareHit() {
			this.attrLastMove('[anim] Trick Room');
		},
		self: {
			onHit(pokemon) {
				const sideConditions = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge'];
				for (const condition of sideConditions) {
					if (pokemon.side.removeSideCondition(condition)) {
						this.add('-sideend', pokemon.side, this.dex.conditions.get(condition).name, '[from] move: Time Skip', '[of] ' + pokemon);
					}
				}
				// 9 turn addition so the +1 from nextTurn totals to 10 turns
				this.turn += 9;
			},
		},
		secondary: null,
		target: "all",
		type: "Dragon",
	},

	// Mia
	testinginproduction: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "A description has not been added yet",
		name: "Testing in Production",
		gen: 9,
		pp: 5,
		priority: 0,
		flags: {},
		onPrepareHit() {
			this.attrLastMove('[anim] Curse');
		},
		onHit(pokemon) {
			this.add(`c:|${getName('Mia')}|Please don't break...`);
			let stats: BoostID[] = [];
			const boost: SparseBoostsTable = {};
			let statPlus: BoostID;
			for (statPlus in pokemon.boosts) {
				if (statPlus === 'accuracy' || statPlus === 'evasion') continue;
				if (pokemon.boosts[statPlus] < 6) {
					stats.push(statPlus);
				}
			}
			let randomStat: BoostID | undefined = stats.length ? this.sample(stats) : undefined;
			if (randomStat) boost[randomStat] = 2;

			stats = [];
			let statMinus: BoostID;
			for (statMinus in pokemon.boosts) {
				if (statMinus === 'accuracy' || statMinus === 'evasion') continue;
				if (pokemon.boosts[statMinus] > -6) {
					stats.push(statMinus);
				}
			}
			randomStat = stats.length ? this.sample(stats) : undefined;
			if (randomStat) {
				if (boost[randomStat]) {
					boost[randomStat] = 0;
					this.add(`c:|${getName('Mia')}|Well. Guess that broke. Time to roll back.`);
					return;
				} else {
					boost[randomStat] = -2;
				}
			}

			this.boost(boost, pokemon, pokemon);
		},
		onAfterMove(pokemon) {
			if (this.randomChance(1, 10)) {
				this.add(`c:|${getName('Mia')}|Ouch! That crash is really getting on my nerves...`);
				this.damage(pokemon.baseMaxhp / 10);
				if (pokemon.hp <= 0) return;
			}

			if (this.randomChance(1, 20)) {
				const status = this.sample(['frz', 'brn', 'psn', 'par']);
				let statusText = status;
				if (status === 'frz') {
					statusText = 'froze';
				} else if (status === 'brn') {
					statusText = 'burned';
				} else if (status === 'par') {
					statusText = 'paralyzed';
				} else if (status === 'psn') {
					statusText = 'poisoned';
				}

				this.add(
					`c:|${getName('Mia')}|` +
					`Darn. A bug ${statusText} me. Guess I should have tested this first.`
				);
				pokemon.setStatus(status);
			}
		},
		secondary: null,
		target: "self",
		type: "Electric",
	},

	// Peary
	"1000gears": {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "1000 Gears",
		shortDesc: "Heals 100% HP,cures status,+1 def/spd,+5 levels",
		pp: 1,
		priority: 0,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(pokemon) {
			this.add('-anim', pokemon, 'Shift Gear', pokemon);
			this.add('-anim', pokemon, 'Belly Drum', pokemon);
		},
		onHit(target, pokemon, move) {
			this.heal(pokemon.maxhp, pokemon, pokemon, move);
			pokemon.cureStatus();
			this.boost({def: 1, spd: 1});
			(pokemon as any).level += 5;
			pokemon.details = pokemon.species.name + (pokemon.level === 100 ? '' : ', L' + pokemon.level) +
				(pokemon.gender === '' ? '' : ', ' + pokemon.gender) + (pokemon.set.shiny ? ', shiny' : '');
			this.add('-anim', pokemon, 'Geomancy', pokemon);
			this.add('replace', pokemon, pokemon.details);
			this.add('-message', `${pokemon.name} gained 5 levels!`);
		},
		isZ: "pearyumz",
		secondary: null,
		target: "self",
		type: "Steel",
	},

	// phoopes
	gen1blizzard: {
		accuracy: 90,
		basePower: 120,
		category: "Special",
		name: "Gen 1 Blizzard",
		desc: "Has a 10% chance to freeze the target.",
		shortDesc: "10% chance to freeze the target.",
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onPrepareHit() {
			this.attrLastMove('[anim] Blizzard');
		},
		secondary: {
			chance: 10,
			status: 'frz',
		},
		target: "normal",
		type: "Ice",
	},

	// ReturnToMonkey
	monkemagic: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Monke Magic",
		shortDesc: "Sets Trick Room; user SpA +1.",
		pp: 5,
		priority: -7,
		flags: {},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Trick', target);
			this.add('-anim', source, 'Trick Room', target);
			this.add('-anim', source, 'Nasty Plot', target);
		},
		pseudoWeather: 'trickroom',
		self: {
			boosts: {
				spa: 1,
			},
		},
		target: "all",
		type: "Psychic",
	},

	// Rumia
	midnightbird: {
		accuracy: 100,
		basePower: 85,
		category: "Special",
		name: "Midnight Bird",
		shortDesc: "+1 Special Attack on hit.",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Memento', target);
			this.add('-anim', source, 'Brutal Swing', target);
		},
		secondary: {
			chance: 100,
			self: {
				boosts: {
					spa: 1,
				},
			},
		},
		target: "normal",
		type: "Dark",
	},

	// Scotteh
	purification: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Purification",
		pp: 5,
		priority: 0,
		flags: {heal: 1, bypasssub: 1, allyanim: 1},
		onPrepareHit() {
			this.attrLastMove('[anim] Moonlight');
		},
		onHit(pokemon) {
			const success = !!this.heal(this.modify(pokemon.maxhp, 0.5));
			return pokemon.cureStatus() || success;
		},
		secondary: null,
		target: "self",
		type: "Water",
	},

	// sharp_claw
	treacheroustraversal: {
		accuracy: 100,
		basePower: 70,
		category: "Physical",
		shortDesc: "Clears hazards, sets spikes, and pivots out.",
		name: "Treacherous Traversal",
		gen: 9,
		pp: 20,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Defog', source);
			this.add('-anim', source, 'Extreme Speed', target);
		},
		selfSwitch: true,
		self: {
			onHit(source) {
				for (const side of source.side.foeSidesWithConditions()) {
					if (source.species.name === 'Sneasel') {
						side.addSideCondition('spikes');
					} else {
						side.addSideCondition('toxicspikes');
					}
				}
			},
		},
		secondary: {}, // allows sheer force to trigger
		target: "normal",
		type: "Rock",
	},

	// smely socks
	stockholmsyndrome: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Curses and traps foe. User loses 1/2 HP.",
		name: "Stockholm Syndrome",
		pp: 5,
		priority: 0,
		flags: {bypasssub: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Curse', target);
			this.add('-anim', source, 'Block', target);
		},
		onHit(target, source, move) {
			let success = false;
			if (!target.volatiles['curse']) {
				this.directDamage(source.maxhp / 2, source, source);
				target.addVolatile('curse');
				success = true;
			}
			return target.addVolatile('trapped', source, move, 'trapper') || success;
		},
		zMove: {effect: 'heal'},
		secondary: null,
		target: "normal",
		type: "Ghost",
	},

	// snake_rattler
	conceptrelevant: {
		accuracy: 100,
		basePower: 70,
		category: "Physical",
		shortDesc: "Psn + clears hazards, sets spikes, then switches out.",
		name: "Concept Relevant",
		gen: 9,
		pp: 15,
		priority: 0,
		flags: {contact: 1, protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Mortal Spin', target);
			this.add('-anim', source, 'Spikes', target);
			this.add('-anim', source, 'U-turn', target);
		},
		onAfterHit(target, pokemon) {
			if (pokemon.hp && pokemon.removeVolatile('leechseed')) {
				this.add('-end', pokemon, 'Leech Seed', '[from] move: Concept Relevant', '[of] ' + pokemon);
			}
			const sideConditions = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge'];
			for (const condition of sideConditions) {
				if (pokemon.hp && pokemon.side.removeSideCondition(condition)) {
					this.add('-sideend', pokemon.side, this.dex.conditions.get(condition).name, '[from] move: Concept Relevant', '[of] ' + pokemon);
				}
			}
			if (pokemon.hp && pokemon.volatiles['partiallytrapped']) {
				pokemon.removeVolatile('partiallytrapped');
			}
			target.side.addSideCondition('spikes');
		},
		onAfterSubDamage(damage, target, pokemon) {
			if (pokemon.hp && pokemon.removeVolatile('leechseed')) {
				this.add('-end', pokemon, 'Leech Seed', '[from] move: Concept Relevant', '[of] ' + pokemon);
			}
			const sideConditions = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge'];
			for (const condition of sideConditions) {
				if (pokemon.hp && pokemon.side.removeSideCondition(condition)) {
					this.add('-sideend', pokemon.side, this.dex.conditions.get(condition).name, '[from] move: Concept Relevant', '[of] ' + pokemon);
				}
			}
			if (pokemon.hp && pokemon.volatiles['partiallytrapped']) {
				pokemon.removeVolatile('partiallytrapped');
			}
			target.side.addSideCondition('spikes');
		},
		secondary: {
			chance: 100,
			status: 'psn',
		},
		selfSwitch: true,
		target: "normal",
		type: "Bug",
	},

	// spoo
	spoo: {
		accuracy: 100,
		basePower: 100,
		basePowerCallback(pokemon, target, move) {
			if (pokemon.baseSpecies.baseSpecies === 'Mumbao') {
				return 90;
			}
			return move.basePower;
		},
		category: "Special",
		shortDesc: "Changes Form. Mumbao: Fairy, 90BP, Clears boosts.",
		name: "spoo",
		gen: 9,
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onTryMove(pokemon) {
			if (pokemon.baseSpecies.baseSpecies === 'Mumbao') {
				this.attrLastMove('[anim] Fleur Cannon');
			} else {
				this.attrLastMove('[anim] Frenzy Plant');
			}
		},
		onModifyType(move, pokemon) {
			if (pokemon.baseSpecies.baseSpecies === 'Mumbao') {
				move.type = 'Fairy';
			}
		},
		onHit(target, pokemon, move) {
			if (['Mumbao', 'Jumbao'].includes(pokemon.baseSpecies.baseSpecies) && !pokemon.transformed) {
				move.willChangeForme = true;
				if (pokemon.baseSpecies.baseSpecies === 'Mumbao') {
					target.clearBoosts();
					this.add('-clearboost', target);
				}
			}
		},
		onAfterMoveSecondarySelf(pokemon, target, move) {
			if (move.willChangeForme) {
				this.add('-anim', pokemon, 'Geomancy', pokemon);
				const spooForme = pokemon.species.id === 'jumbao' ? '' : '-Jumbao';
				changeSet(this, pokemon, ssbSets['spoo' + spooForme], true);
			}
		},
		secondary: null,
		target: "normal",
		type: "Grass",
	},

	// Theia
	bodycount: {
		accuracy: 100,
		basePower: 50,
		basePowerCallback(pokemon, target, move) {
			return 50 + 50 * pokemon.side.totalFainted;
		},
		category: "Special",
		shortDesc: "+50 power for each time a party member fainted.",
		name: "Body Count",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onPrepareHit() {
			this.attrLastMove('[anim] Core Enforcer');
		},
		secondary: null,
		target: "normal",
		type: "Ghost",
	},

	// TheJesucristoOsAma
	theloveofchrist: {
		accuracy: 100,
		basePower: 0,
		category: "Status",
		shortDesc: "Attracts and confuses the target.",
		name: "The Love Of Christ",
		gen: 9,
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {protect: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Morning Sun', source);
			this.add('-anim', source, 'Lovely Kiss', target);
		},
		onHit(target, source) {
			target.addVolatile('attract', source);
			target.addVolatile('confusion', source);
		},
		secondary: null,
		target: "normal",
		type: "Normal",
	},

	// trace
	chronostasis: {
		accuracy: 90,
		basePower: 80,
		category: "Special",
		shortDesc: "If target is KOed, user boosts a random stat by 2.",
		name: "Chronostasis",
		gen: 9,
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onPrepareHit() {
			this.attrLastMove('[anim] Future Sight');
		},
		onAfterMoveSecondarySelf(pokemon, target, move) {
			if (!target || target.fainted || target.hp <= 0) {
				const stats: BoostID[] = [];
				let stat: BoostID;
				for (stat in target.boosts) {
					if (stat === 'accuracy' || stat === 'evasion') continue;
					if (target.boosts[stat] < 6) {
						stats.push(stat);
					}
				}
				if (stats.length) {
					const randomStat = this.sample(stats);
					this.boost({[randomStat]: 2}, pokemon, pokemon, move);
				}
			}
		},
		secondary: null,
		target: "normal",
		type: "Psychic",
	},

	// UT
	wingover: {
		accuracy: 100,
		basePower: 70,
		category: "Physical",
		shortDesc: "Damages foe and pivots out.",
		name: "Wingover",
		pp: 20,
		priority: 0,
		flags: {contact: 1, protect: 1, mirror: 1},
		onPrepareHit() {
			this.attrLastMove('[anim] U-turn');
		},
		selfSwitch: true,
		secondary: null,
		target: "normal",
		type: "Flying",
	},

	// Violet
	waterfowldance: {
		accuracy: 95,
		basePower: 7,
		category: "Physical",
		shortDesc: "Hits 10 times. Heals 100% of damage dealt.",
		name: "Waterfowl Dance",
		gen: 9,
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1, heal: 1, dance: 1},
		drain: [1, 1],
		onPrepareHit() {
			this.attrLastMove('[anim] Sacred Sword');
		},
		multihit: 10,
		multiaccuracy: true,
		secondary: null,
		target: "normal",
		type: "Flying",
	},
	scarletaeoniaterrain: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Scarlet Aeonia Terrain",
		shortDesc: "5 turns: Contact moves have 25% to badly psn vs grounded.",
		pp: 10,
		priority: 0,
		flags: {nonsky: 1},
		pseudoWeather: 'scarletaeoniaterrain',
		condition: {
			duration: 5,
			durationCallback(source, effect) {
				if (source?.hasItem('terrainextender')) {
					return 8;
				}
				return 5;
			},
			onFieldStart(field, source, effect) {
				if (effect?.effectType === 'Ability') {
					this.add('-fieldstart', 'move: Scarlet Aeonia Terrain', '[from] ability: ' + effect.name, '[of] ' + source);
				} else {
					this.add('-fieldstart', 'move: Scarlet Aeonia Terrain');
				}
			},
			onModifyMove(move, source, target) {
				if (!target?.isGrounded()) return;
				if (!move?.flags['contact'] || move.target === 'self') return;
				if (!move.secondaries) {
					move.secondaries = [];
				}
				move.secondaries.push({
					chance: 25,
					status: 'tox',
				});
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 1,
			onFieldEnd() {
				this.add('-fieldend', 'move: Scarlet Aeonia Terrain');
			},
		},
		secondary: null,
		target: "all",
		type: "Poison",
	},

	// Yellow Paint
	whiteout: {
		accuracy: 85,
		basePower: 70,
		category: "Special",
		shortDesc: "Sets up Snow. Target's ability becomes Normalize.",
		name: "Whiteout",
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1, bullet: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, "Weather Ball", target);
			this.add('-anim', source, "Snowscape", source);
		},
		onHit(target) {
			this.field.setWeather('snow');
			if (target.setAbility('normalize')) {
				this.add('-ability', target, 'Normalize', '[from] move: Whiteout');
			}
			this.add(`c:|${getName('Yellow Paint')}|A blank canvas.`);
		},
		secondary: null,
		target: "normal",
		type: "Ice",
	},

	// Zalm
	dudurafish: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Heals 25% HP and sets Aqua Ring.",
		name: "Dud ur a fish",
		pp: 5,
		priority: 0,
		flags: {heal: 1, snatch: 1},
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', target, "Recover", source);
			this.add('-anim', target, "Aqua Ring", source);
		},
		onHit(pokemon) {
			let didSomething: boolean;
			if (pokemon.hasType("Water")) {
				didSomething = !!this.heal(this.modify(pokemon.baseMaxhp, 1, 2));
				didSomething = pokemon.cureStatus() || didSomething;
			} else {
				didSomething = !!this.heal(this.modify(pokemon.baseMaxhp, 1, 4));
			}
			didSomething = pokemon.addVolatile('aquaring') || didSomething;
			return didSomething;
		},
		secondary: null,
		target: "self",
		type: "Water",
	},

	// zee
	solarsummon: {
		accuracy: 100,
		basePower: 0,
		category: "Status",
		shortDesc: "Sets up Sunny Day and creates a Substitute.",
		name: "Solar Summon",
		gen: 9,
		pp: 5,
		priority: 0,
		flags: {},
		onPrepareHit() {
			this.attrLastMove('[anim] Sunny Day');
		},
		onHit(pokemon) {
			let success = false;
			if (this.field.setWeather('sunnyday')) success = true;
			if (!pokemon.volatiles['substitute']) {
				if (pokemon.hp <= pokemon.maxhp / 4 || pokemon.maxhp === 1) { // Shedinja clause
					this.add('-fail', pokemon, 'move: Substitute', '[weak]');
				} else {
					pokemon.addVolatile('substitute');
					this.directDamage(pokemon.maxhp / 4);
					success = true;
				}
			}
			return success;
		},
		secondary: null,
		target: "self",
		type: "Fire",
	},

	// Modified various moves to support havi's ability
	dreameater: {
		inherit: true,
		onTryImmunity(target) {
			return target.status === 'slp' || target.hasAbility(['comatose', 'mensiscage']);
		},
	},
	hex: {
		inherit: true,
		basePowerCallback(pokemon, target, move) {
			if (target.status || target.hasAbility(['comatose', 'mensiscage'])) {
				this.debug('BP doubled from status condition');
				return move.basePower * 2;
			}
			return move.basePower;
		},
	},
	infernalparade: {
		inherit: true,
		basePowerCallback(pokemon, target, move) {
			if (target.status || target.hasAbility(['comatose', 'mensiscage'])) return move.basePower * 2;
			return move.basePower;
		},
	},
	nightmare: {
		inherit: true,
		condition: {
			noCopy: true,
			onStart(pokemon) {
				if (pokemon.status !== 'slp' && !pokemon.hasAbility(['comatose', 'mensiscage'])) {
					return false;
				}
				this.add('-start', pokemon, 'Nightmare');
			},
			onResidualOrder: 11,
			onResidual(pokemon) {
				this.damage(pokemon.baseMaxhp / 4);
			},
		},
	},
	rest: {
		inherit: true,
		onTry(source) {
			if (source.status === 'slp' || source.hasAbility(['comatose', 'mensiscage'])) return false;

			if (source.hp === source.maxhp) {
				this.add('-fail', source, 'heal');
				return null;
			}
			if (source.hasAbility(['insomnia', 'vitalspirit'])) {
				this.add('-fail', source, '[from] ability: ' + source.getAbility().name, '[of] ' + source);
				return null;
			}
		},
	},
	sleeptalk: {
		inherit: true,
		onTry(source) {
			return source.status === 'slp' || source.hasAbility(['comatose', 'mensiscage']);
		},
	},
	snore: {
		inherit: true,
		onTry(source) {
			return source.status === 'slp' || source.hasAbility(['comatose', 'mensiscage']);
		},
	},
	wakeupslap: {
		inherit: true,
		basePowerCallback(pokemon, target, move) {
			if (target.status === 'slp' || target.hasAbility(['comatose', 'mensiscage'])) {
				this.debug('BP doubled on sleeping target');
				return move.basePower * 2;
			}
			return move.basePower;
		},
	},
};
