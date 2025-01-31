## Verifying files sent from me

keyterms:
channel - method i communicate - inperson/youtube channel/text message

1. I can give everyone my public key in 1 channel so everyone can get stuff from me whenever i decide to give them something


2. if i want to give everyone my latest program.exe, i give out my program, hash.txt which is a file that says this is the hash of the program, then a hash.txt.sig which is a signature saying that i signed this hash.txt with my private key and it will be a legitimate file. 

3. users use this website to verify the signature, did this hash.txt come from me and was it modified? nope, so everyone can now trust the hash.txt (maybe more details later)

4. read the hash file, inside i should say something like this is my program.exe and the hash of it will be xyz.

5. my website again will hash the program.exe and we effectively will see what program i have downloaded. now im the user and i just hashed the program i downloaded with my own pc and then the user will now read my hash.txt that says what the hash will be. if the hashes dont match, the file is tampered with, if they do match, the file is almost legit

6. one more thing is that at this point the signature can be legit, and the file hashes can match. but what if someone forged a public key that actually imitates me and now somehow you have a public key that has my email but thats not my key. there can be many keys that use my email because they try to forge me. then i tell you in a seperate channel from the file sharing channel and public key sharing channel, what my fingerprint is. i will probably give you guys my finger print in person like a qr code should be easy but i will tell you in person. 

7. now if everything says legit and fingerprints match, this file should be 100% legitimate
