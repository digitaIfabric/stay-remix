let muteSwitch = 0
let timeSwitch = 0
import {ElementaryNodeRenderer as core, el} from '@elemaudio/core-lite';
import { Note, Scale, Chord } from "@tonaljs/tonal";
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import kick from './drum/kick.js';
  
function modulate(x, rate, amount) {
    return el.add(x, el.mul(amount, el.cycle(rate)));
}

function voice(fq) {
    return el.cycle(
        el.add(
            fq,
            el.mul(
                el.mul(el.add(2, el.cycle(0.1)), el.mul(fq, 0)),
                el.cycle(fq),
            ),
        ),
    );
}

function synthVoice(voice) {
    let gate = el.const({key: `${voice.key}:gate`, value: voice.gate});
    let env = el.adsr(4.0, 2.0, 0.5, 2.0, gate);

    return el.mul(
        env,
        el.blepsaw(
        el.const({key: `${voice.key}:freq`, value: voice.freq})
        )
    );
}

function chord(voice) {
    return el.cycle(
        el.add(
            voice.freq
        ),
)   ;
}

let KEY = 'Db'
let KEY_NOTES = Scale.get(KEY + ' major').notes;
const KEY_NOTES_4 = KEY_NOTES.map(note => note + '4' );
const KEY_NOTES_5 = KEY_NOTES.map(note => note + '5' );
const KEY_NOTES_4_5 = [...KEY_NOTES_4, ...KEY_NOTES_4, ...KEY_NOTES_5, KEY_NOTES_5[0]];
const FREQUENCIES = KEY_NOTES_4_5.map(note => Note.freq(note)); 
// [
    //     277.1826309768721, 311.12698372208087,
    //     349.2282314330039, 369.99442271163446,
    //     415.3046975799451,  466.1637615180899,
    //     261.6255653005986,  277.1826309768721,
    //    311.12698372208087,  349.2282314330039,
    //    369.99442271163446,  415.3046975799451,
    //     466.1637615180899,  261.6255653005986,
    //     554.3652619537442,  622.2539674441618,
    //     698.4564628660078,  739.9888454232689,
    //     830.6093951598903,  932.3275230361799,
    //     523.2511306011972
    //  ]
    const FREQ_SHUFFLE = FREQUENCIES
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
    console.log('FS', FREQ_SHUFFLE);
    // [
    //     554.3652619537442, 311.12698372208087,
    //    369.99442271163446,  349.2282314330039,
    //     466.1637615180899,  277.1826309768721,
    //     466.1637615180899, 369.99442271163446,
    //     415.3046975799451,  830.6093951598903,
    //     698.4564628660078,  739.9888454232689,
    //     415.3046975799451,  554.3652619537442,
    //     523.2511306011972,  261.6255653005986,
    //    311.12698372208087,  932.3275230361799,
    //     277.1826309768721,  349.2282314330039,
    //     261.6255653005986,  622.2539674441618
    //  ]
    
let tempo = 127.5;
let A4 = 440;
let gate = el.train(tempo/60);
let T = timeSwitch ? 4 : 1/2;
let gateArp = el.train(tempo/60 * T);
let gateEight = el.train(tempo/60 * 8);
let gateFour = el.train(tempo/60 * 4);
let gateDouble = el.train(tempo/60 * 2);
let gateLoop = el.train(0);
const kickPattern = [1, 0];
const snarePattern  = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];
const snarePattern2 = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1];
const hatPattern    = [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0];
const hatPattern2   = [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1];
const hatPattern3   = [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0];
let kickSeq2 = el.seq({key: 'sq1', seq: kickPattern, hold: true}, gateDouble);
let snareSeq = el.seq({key: 'sq2', seq: snarePattern, hold: true}, gateDouble);
let hatSeq = el.seq({key: 'sq3', seq: hatPattern2, hold: true}, gateEight);
let kickSeq = el.seq({key: 'sq4', seq: kickPattern, hold: true}, gate);
let kickSound = kick(40, 0.1, 0.255, 0.005, 1, kickSeq);

// CHORDS
let CHORDS = KEY_NOTES_4.map(note => Chord.get(note+'maj7').notes);
// console.log(CHORDS);
const CHORD_FREQS = CHORDS.map((nested) => {
    return nested.map((note) => {
        return Note.freq(note); 
    });
});
// console.log('CF', CHORD_FREQS);
// let num = Math.floor(Math.random() * CHORD_FREQS.length);
let voices = [
    {gate: tempo/60*0.5, freq: CHORD_FREQS[0][0], key: 'v1'},
    {gate: tempo/60*0.5, freq: CHORD_FREQS[0][1], key: 'v2'},
    {gate: tempo/60*0.5, freq: CHORD_FREQS[0][2], key: 'v3'},
    {gate: tempo/60*0.5, freq: CHORD_FREQS[0][3], key: 'v4'},
];
let voices2 = [
    {gate: tempo/60*0.5, freq: CHORD_FREQS[3][0], key: 'v5'},
    {gate: tempo/60*0.5, freq: CHORD_FREQS[3][1], key: 'v6'},
    {gate: tempo/60*0.5, freq: CHORD_FREQS[3][2], key: 'v7'},
    {gate: tempo/60*0.5, freq: CHORD_FREQS[3][3], key: 'v8'},
];


let ch = el.add(voices2.map(synthVoice));
let chch = el.add(voices.map(chord))
let chchch = el.mul(0.10, chch);

// Then we'll apply a lowpass filter at 800Hz, with LFO modulation at 1.1Hz that sweeps
// along [-400, 400], thereby modulating our lowpass cutoff between [400Hz, 1200Hz].
let filtered = el.lowpass(modulate(800, 1.1, 400), 1.4, ch);

// Next we apply a little bit of feedback delay to the filtered signal to create some
// space and movement.
let delayed = el.delay({size: 44100}, el.ms2samps(60000/tempo), 0.6, filtered);

// Sum the delayed signal with the original.
let wetdry = el.add(filtered, delayed);

// SYNTH
    
// 1. Attack time in seconds (number or signal)
// 2. Decay time in seconds (number or signal)
// 3. Sustain amplitude between 0 and 1 (number or signal)
// 4. Release time in seconds (number or signal)
// 5. Gate signal; a pulse train alternating between 0 and 1
let env = el.adsr(0.005, 0.001, 0.2, 0.6, gateArp);
// Now we construct the left and right channel signals: in each channel we run our synth
// voice over the two sequences of frequency values we constructed above, using the `hold` property
// on `el.seq` to hold its output value right up until the next rising edge of the gate.
let left = el.mul(env, voice(el.seq({key: 'arp', seq: FREQ_SHUFFLE, hold: true}, gateArp)));
let T2 = timeSwitch ? 4/10 : 8/10;
let T3 = timeSwitch ? 3/4 : 3/4;
let delayedLeft = el.delay({size: 44100}, el.ms2samps((60000/tempo) * T3), T2, left);

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_PATH = resolve(__dirname, './stay-1.wav');
const VOCAL_SAMPLE = resolve(__dirname, './stay-paul-1.wav');
const KICK_SAMPLE = resolve(__dirname, './drum/Kick.wav');
const SNARE1_SAMPLE = resolve(__dirname, './drum/Snare 01.wav');
const SNARE2_SAMPLE = resolve(__dirname, './drum/Snare 02.wav');
const SNARELINN_SAMPLE = resolve(__dirname, './drum/Snare Linn.wav');
const HIHAT_SAMPLE = resolve(__dirname, './drum/Hihat-808-CLosed.wav');
const KEY_SAMPLE = resolve(__dirname, './stay-key.wav');
const LOOP_SAMPLE = resolve(__dirname, './stay-loop.wav');
const JUICE1_SAMPLE = resolve(__dirname, './juice-1.wav');
const JUICE2_SAMPLE = resolve(__dirname, './juice-2.wav');
const RIFF_SAMPLE = resolve(__dirname, './stay-riff.wav');

// SAMPLES
let kickBus = el.mul(0.4, kickSound);
let staySampleL = el.mul(0.8, el.sample({key: 'sl', path: SAMPLE_PATH, mode: 'loop', channel: 0}, gateLoop));
let staySampleR = el.mul(0.8, el.sample({key: 'sr',  path: SAMPLE_PATH, mode: 'loop', channel: 1}, gateLoop));
let juice1L     = el.mul(1.5, el.sample({path: JUICE1_SAMPLE, mode: 'loop', channel: 0}, gateLoop));
let juice1R     = el.mul(1.5, el.sample({path: JUICE1_SAMPLE, mode: 'loop', channel: 1}, gateLoop));
let juice2L     = el.mul(1.0, el.sample({key: 'j1', path: JUICE2_SAMPLE, mode: 'loop', channel: 0}, gateLoop));
let juice2R     = el.mul(1.0, el.sample({key: 'j2', path: JUICE2_SAMPLE, mode: 'loop', channel: 1}, gateLoop));
let stayPaulL   = el.mul(0.2, el.sample({key: 'p1', path: VOCAL_SAMPLE, mode: 'loop', channel: 0}, gateLoop));
let stayPaulR   = el.mul(0.2, el.sample({key: 'p2', path: VOCAL_SAMPLE, mode: 'loop', channel: 1}, gateLoop));
let stayKeyL    = el.mul(0.9, el.sample({key: 'key1', path: KEY_SAMPLE, mode: 'loop', channel: 0}, gateLoop));
let stayKeyR    = el.mul(0.9, el.sample({key: 'key2', path: KEY_SAMPLE, mode: 'loop', channel: 1}, gateLoop));
let kickL       = el.mul(0.6, el.sample({key: 'k1', path: KICK_SAMPLE, mode: 'trigger', channel: 0}, kickSeq2));
let kickR       = el.mul(0.6, el.sample({key: 'k2', path: KICK_SAMPLE, mode: 'trigger', channel: 1}, kickSeq2));
let hat         = el.mul(0.02, el.sample({key: 'hat', path: HIHAT_SAMPLE, mode: 'trigger', channel: 0}, hatSeq));
let Db4 = A4*2^(4/12);
let eqHat = el.peak(Db4*8, 0.7, 10, hat);
let eqHat2 = el.peak(Db4*16, 0.7, 10, hat);
let eqHat3 = el.peak(Db4*4, 0.7, 10, hat);
let hatEqd = el.add(eqHat, eqHat2, eqHat3);
let hatEqdDelayed = el.delay({size: 44100}, el.ms2samps((60000/tempo) * 3/4), 0.8, hatEqd);
let stayRiffL   = el.delay({size: 44100}, el.ms2samps(60000/tempo), 2/3, el.mul(1, el.sample({key: 'r1', path: RIFF_SAMPLE, mode: 'loop', channel: 0}, gateLoop)));
let stayRiffR   = el.delay({size: 44100}, el.ms2samps(60000/tempo), 2/3, el.mul(1, el.sample({key: 'r2',  path: RIFF_SAMPLE, mode: 'loop', channel: 1}, gateLoop)));
let snare1L     = el.mul(0.2, el.sample({key: 's1', path: SNARE1_SAMPLE, mode: 'trigger', channel: 0}, snareSeq));
let snare1R     = el.mul(0.2, el.sample({key: 's2', path: SNARE1_SAMPLE, mode: 'trigger', channel: 1}, snareSeq));
let snare2L     = el.mul(0.2, el.sample({key: 's3', path: SNARE2_SAMPLE, mode: 'trigger', channel: 0}, snareSeq));
let snare2R     = el.mul(0.2, el.sample({key: 's4', path: SNARE2_SAMPLE, mode: 'trigger', channel: 1}, snareSeq));
let snareLinnL  = el.mul(0.2, el.sample({key: 's5', path: SNARELINN_SAMPLE, mode: 'trigger', channel: 0}, snareSeq));
let snareLinnR  = el.mul(0.2, el.sample({key: 's6', path: SNARELINN_SAMPLE, mode: 'trigger', channel: 1}, snareSeq));
let snare3L = el.add(snare1L, snare2L, snareLinnL);
let snare3R = el.add(snare1R, snare2R, snareLinnR);
let loop       = el.mul(0.5, el.sample({key: 'l1', path: LOOP_SAMPLE, mode: 'loop', channel: 0}, gateLoop));
// let delayLoop  = el.delay({size: 44100}, el.ms2samps(60000/tempo), 0.6, loop);
let drumBusL = el.add(kickL, snare1L, snare2L, snareLinnL, hatEqd);
let drumBusR = el.add(kickR, snare1R, snare2R, snareLinnR, hatEqd);
let delayDrumL  = el.delay({size: 44100}, el.ms2samps((60000/tempo) * 3/4), 0.6, drumBusL);
let delayDrumR  = el.delay({size: 44100}, el.ms2samps((60000/tempo) * 3/4), 0.6, drumBusR);
let outL = el.add(stayPaulL, el.compress(1, 200, -33, 5, kickBus, staySampleL));
let outR = el.add(stayPaulR, el.compress(1, 200, -33, 5, kickBus, staySampleR));
let eqOut = el.peak(Db4*8, 0.7, 5, outL);
let eqOut2 = el.peak(Db4*16, 0.7, 5, outL);
let eqOut3 = el.peak(Db4*4, 0.7, 5, outL); 
let outEqd = el.add(eqOut, eqOut2, eqOut3);
let arp = el.mul(0.5, delayedLeft);
let mainL = el.add(juice2L, stayPaulL, drumBusL, stayKeyL, arp);
let mainR = el.add(juice2R, stayPaulR, drumBusR, stayKeyR, arp);
let main2L = el.add(juice2L, stayPaulL, drumBusL, stayKeyL, loop);
let main2R = el.add(juice2R, stayPaulR, drumBusR, stayKeyR, loop);
let outroDelayedL = el.add(delayDrumL);
let outroDelayedR = el.add(delayDrumR);
let chordsL = el.mul(0.0125, wetdry)
let chordsR = el.mul(0.0125, wetdry)
let outroL = el.add(drumBusL, loop);
let outroR = el.add(drumBusR, loop);
let introL = muteSwitch ? el.mul(0, arp) : timeSwitch ? el.add(arp, chordsL) : el.add(arp, chordsL, kickL, chchch, snare2L);
let introR = muteSwitch ? el.mul(0, arp) : timeSwitch ? el.add(arp, chordsR) : el.add(arp, chordsR, kickR, chchch, snare2R);
let chorusL = el.add(arp, chordsL, loop, kickL, snare3L, juice2L);
let chorusR = el.add(arp, chordsR, loop, kickR, snare3R, juice2R);
let intro2L = el.add(stayPaulL, juice2L, drumBusL, stayKeyL);
let intro2R = el.add(stayPaulR, juice2R, drumBusR, stayKeyR);
let muteL = el.mul(0, outL);
let muteR = el.mul(0, outR);

export default function render(){
    // core.render(outL, outR);
    // core.render(drumBusL, drumBusR);
    // core.render(outroL, outroR);
    core.render(introL, introR);
    // core.render(muteL, muteR);          
    // core.render(chorusL, chorusR);
    // core.render(intro2L, intro2R);
    // core.render(mainL, mainR);
    // core.render(main2L, main2R);
    // core.render(outroDelayedL, outroDelayedR);
    // core.render(staySampleL, staySampleR);
    
}
