package com.visunex.utils;

import java.security.*;
import java.io.IOException;
import java.io.InputStream;
import java.io.FileInputStream;
import java.io.DataInputStream;
import java.io.ByteArrayInputStream;
import java.io.FileOutputStream;
import java.security.spec.*;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;
import java.util.Collection;
import java.util.Iterator;

/**
 * CertConvert.java
 *
 * <p>This class imports a key and a certificate into a keystore
 * (<code>$home/keystore.ImportKey</code>). If the keystore is
 * already present, it is simply deleted. Both the key and the
 * certificate file must be in <code>DER</code>-format. The key must be
 * encoded with <code>PKCS#8</code>-format. The certificate must be
 * encoded in <code>X.509</code>-format.</p>
 *
 * <p>Key format:</p>
 * <p><code>openssl pkcs8 -topk8 -nocrypt -in YOUR.KEY -out YOUR.KEY.der
 * -outform der</code></p>
 * <p>Format of the certificate:</p>
 * <p><code>openssl x509 -in YOUR.CERT -out YOUR.CERT.der -outform
 * der</code></p>
 * <p>Import key and certificate:</p>
 * <p><code>java comu.ImportKey YOUR.KEY.der YOUR.CERT.der</code></p><br />
 *
 * <p><em>Caution:</em> the old <code>keystore.ImportKey</code>-file is
 * deleted and replaced with a keystore only containing <code>YOUR.KEY</code>
 * and <code>YOUR.CERT</code>. The keystore and the key has no password; 
 * they can be set by the <code>keytool -keypasswd</code>-command for setting
 * the key password, and the <code>keytool -storepasswd</code>-command to set
 * the keystore password.
 * <p>The key and the certificate is stored under the alias
 * <code>importkey</code>; to change this, use <code>keytool -keyclone</code>.
 *
 * Created: Fri Apr 13 18:15:07 2001
 * Updated: Fri Apr 19 11:03:00 2002
 *
 * @author Joachim Karrer, Jens Carlberg
 * @version 1.1
 **/
public class CertConvert {
	
	 /**
     * <p>Creates an InputStream from a file, and fills it with the complete
     * file. Thus, available() on the returned InputStream will return the
     * full number of bytes the file contains</p>
     * @param fname The filename
     * @return The filled InputStream
     * @exception IOException, if the Streams couldn't be created.
     **/
    private static InputStream fullStream ( String fname ) throws IOException {
        FileInputStream fis = new FileInputStream(fname);
        DataInputStream dis = new DataInputStream(fis);
        byte[] bytes = new byte[dis.available()];
        dis.readFully(bytes);
        ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
        return bais;
    }
        
    /**
     * <p>Takes two file names for a key and the certificate for the key, 
     * and imports those into a keystore. Optionally it takes an alias
     * for the key.
     * <p>The first argument is the filename for the key. The key should be
     * in PKCS8-format.
     * <p>The second argument is the filename for the certificate for the key.
     * <p>If a third argument is given it is used as the alias. If missing,
     * the key is imported with the alias importkey
     * <p>The name of the keystore file can be controlled by setting
     * the keystore property (java -Dkeystore=mykeystore). If no name
     * is given, the file is named <code>keystore.ImportKey</code>
     * and placed in your home directory.
     * @param args [0] Name of the key file, [1] Name of the certificate file
     * [2] Alias for the key.
     **/
    public static void main ( String args[]) {
        
        // change this if you want another password by default
        String keypass = "visunex123";
        
        // change this if you want another alias by default
        String defaultalias = "visunexserverjks";

        // change this if you want another keystorefile by default
        String keystorename = System.getProperty("visunexserverjks");

        if (keystorename == null)
            /*keystorename = System.getProperty("user.home")+
                System.getProperty("file.separator")+
                "visunexserverjks.jks";*/ // especially this ;-)
            keystorename = "./visunexserverjks.jks";


        // parsing command line input
        String keyfile = "";
        String certfile = "";
        if (args.length < 2 || args.length>3) {
            System.out.println("Usage: java comu.ImportKey keyfile certfile [alias]");
            System.exit(0);
        } else {
            keyfile = args[0];
            certfile = args[1];
            if (args.length>2)
                defaultalias = args[2];
        }

        try {
            // initializing and clearing keystore 
            KeyStore ks = KeyStore.getInstance("JKS", "SUN");
            ks.load( null , keypass.toCharArray());
            System.out.println("Using keystore-file : "+keystorename);
            ks.store(new FileOutputStream ( keystorename  ),
                    keypass.toCharArray());
            ks.load(new FileInputStream ( keystorename ),
                    keypass.toCharArray());

            // loading Key
            InputStream fl = fullStream (keyfile);
            byte[] key = new byte[fl.available()];
            KeyFactory kf = KeyFactory.getInstance("RSA");
            fl.read ( key, 0, fl.available() );
            fl.close();
            PKCS8EncodedKeySpec keysp = new PKCS8EncodedKeySpec ( key );
            PrivateKey ff = kf.generatePrivate (keysp);

            // loading CertificateChain
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            InputStream certstream = fullStream (certfile);

            Collection c = cf.generateCertificates(certstream) ;
            Certificate[] certs = new Certificate[c.toArray().length];

            if (c.size() == 1) {
                certstream = fullStream (certfile);
                System.out.println("One certificate, no chain.");
                Certificate cert = cf.generateCertificate(certstream) ;
                certs[0] = cert;
            } else {
                System.out.println("Certificate chain length: "+c.size());
                certs = (Certificate[])c.toArray();
            }

            // storing keystore
            ks.setKeyEntry(defaultalias, ff, 
                           keypass.toCharArray(),
                           certs );
            System.out.println ("Key and certificate stored.");
            System.out.println ("Alias:"+defaultalias+"  Password:"+keypass);
            ks.store(new FileOutputStream ( keystorename ),
                     keypass.toCharArray());
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

   /* 
    Steps :
    	Tools like in F5 load balancers generate .crt and .key files ( they basically use openssl ).
    	
    	Here .crt is the signed certificate from a CA and key contains the private key.
    	
    	These keys and certificates are in PEM format.
    	
    	– Open both the files in a notepad and copy the contents in it to a new notepad file and save it with extension .pem
    	
    	– Now we need to convert this .pem to .des
    	
    	Note : DES is a binary format and non readable whereas PEM are in human readable form.
    	
   		– You can use the following command to convert PEM to DER format.
   		
   	Command : openssl pkcs8 -topk8 -nocrypt -in key.pem -inform PEM -out key.der -outform DER ( this command will convert the key file (PEM format) containing private key to DER format )
		
	Command : openssl x509 -in cert.pem -inform PEM -out cert.der -outform DER ( This command converts the signed certificate (PEM format) to DER format ).
		
		– Now we need to add the signed certificate and the private key into the keystore.
		
		Keytool does not let you import an existing private key for which you already have a certificate.
   		
   	Command : javac CertConvert.java
   	
		The above code will add the private key and the certificate into a .jks keystore.
		Default name of the keystore that will be created : visunexserverjks.jks ( you can edit the code and change it to identity.jks )
		
		Default password/passphrase for the private key : visunex123 ( you can edit the code to make changes in it accordingly )
		
		Default alias name given to this key would be : visunexserverjks
		
		Once you have the .class file run the command below to generate the keystore ( i.e visunexserverjks.jks ) :
   		
   	Command :  java CertConvert visunexserverkey.der visunexserver.der ( Note the first argument is the key file and the second is the cerificate (both in DER format) )
		
		Note : The keystore is not created in the same directory. You can find it in the root folder ( Eg : C:\Documents and Settings\CoolDragon\… )
    	
    	– Now import your visunexca.crt(root ca) file into this keystore to complete the chaining of certificates
    	
	Command : keytool -import -file visunexca.crt -alias -trustcacerts -keystore visunexserverjks.jks -storepass visunex123
		
		– Now list the certificates of the keystore to check if the chaining is fine :
	
	Command : keytool -v -list -keystore visunexserverjks.jks -storepass visunex123
		
		visunexserverjks.jks file is now ready 
    	
    	*/ 

}


