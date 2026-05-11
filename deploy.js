const FtpDeploy = require("ftp-deploy");
const ftpDeploy = new FtpDeploy();
const fs = require('fs');
const path = require('path');

const config = {
    user: 'u876016926.watchlist.wajrock.me', // Ton identifiant FTP
    password: '@Thibaud5050', // Ton mot de passe FTP
    host: "194.164.74.23", // L'adresse de ton serveur FTP
    port: 21, // Port FTP (21 pour FTP, 22 pour SFTP)
    localRoot: __dirname + "/dist/watchlist-app/browser", // Chemin local du build
    remoteRoot: "/public_html/", // Dossier distant (ex : /public_html/)
    include: ["*", "**/*",".htaccess"], // Inclure tous les fichiers
    deleteRemote: true, // Supprime les anciens fichiers avant d'envoyer les nouveaux
    forcePasv: true // Active le mode passif (nécessaire dans la plupart des cas)
};

const htaccessPath = path.join(__dirname, 'dist/watchlist-app/browser/.htaccess');

const htaccessContent = `
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
`;

fs.writeFileSync(htaccessPath, htaccessContent);
console.log("✅ .htaccess généré");

ftpDeploy.deploy(config)
    .then(() => console.log("Déploiement terminé avec succès !"))
    .catch(err => console.log(err));
