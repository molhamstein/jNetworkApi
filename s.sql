-- MySQL dump 10.13  Distrib 5.7.22, for Linux (x86_64)
--
-- Host: localhost    Database: network_db
-- ------------------------------------------------------
-- Server version	5.7.22-0ubuntu18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ACL`
--

-- DROP TABLE IF EXISTS `ACL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `ACL` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `model` varchar(512) DEFAULT NULL,
  `property` varchar(512) DEFAULT NULL,
  `accessType` varchar(512) DEFAULT NULL,
  `permission` varchar(512) DEFAULT NULL,
  `principalType` varchar(512) DEFAULT NULL,
  `principalId` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ACL`
--

LOCK TABLES `ACL` WRITE;
/*!40000 ALTER TABLE `ACL` DISABLE KEYS */;
/*!40000 ALTER TABLE `ACL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AccessToken`
--

-- DROP TABLE IF EXISTS `AccessToken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `AccessToken` (
  `id` varchar(255) NOT NULL,
  `ttl` int(11) DEFAULT NULL,
  `scopes` text,
  `created` datetime DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AccessToken`
--

LOCK TABLES `AccessToken` WRITE;
/*!40000 ALTER TABLE `AccessToken` DISABLE KEYS */;
INSERT INTO `AccessToken` VALUES ('1qLbUPQne6hjHEDKdVklAzFAFTZrAreG2M456x4NLGnjYeqxRkRV6SSxV5YKjCyV',1209600,NULL,'2018-06-14 00:48:35',9),('3EpPPmQcogA23A8xDmhn4RzeDHvkk2mbFJ5UZkHxQbDMQJ9isnnoGtfe863Ys5yE',1209600,NULL,'2018-06-29 13:07:06',19),('447aePuFXErm2qdypvyETjtDHZaid5qYLRRyT25CO2ldAjpabX1WbHiO5Rw0eZ8u',1209600,NULL,'2018-06-30 10:52:21',18),('55UDICCfC8LqQZYUyHer1uC8SZosUqoGIVAxge9qZT1Spl7aExdFp3z3Yz3O9H6B',1209600,NULL,'2018-06-14 00:36:46',9),('6gMKCsfu7MoSGDBwbUmoLlEhs24Hw18l1t2Aa3Df0mdzGrfMNCdOXOjaKtMR5AU7',1209600,NULL,'2018-06-14 00:53:33',9),('6lBykZ0RGR1WUeKDpiHV9M84FGwKEdSEOXQJ5gLJHEp0WrX63rPquMrdBo1c3Lwj',1209600,NULL,'2018-06-13 16:14:09',7),('8yCV5qCQ0sKRMTbVnrPbJMH9MPcx9h3h2CH48A4QJrjgKVIgnCTeIAd8GVx16PXk',1209600,NULL,'2018-06-14 00:20:02',9),('AHYOmqyYChdjmwX3udWGE8DRs4QK6KdDQwDDfpgDvxOJCeSNOMux5MlENrjSlr0p',1209600,NULL,'2018-06-14 00:36:44',9),('AihmsA4wMnnXQS1XvGZ2s7MijXP5Mhx0tMoCXKarFR1HLG8Ev7wXV9ZjGouWOcZI',1209600,NULL,'2018-06-13 16:13:28',7),('AlooMDTHOFcavv0p27IFo1hBZx01zSCYHUNvj8yqF1YoMxFmqhGn6a6zUofo8DLn',1209600,NULL,'2018-06-29 13:06:22',19),('BkHO0kcD5EKSkdES9LxydDZM7u0ZSMQgOvMbAJ8eVqeZrTaFnJNhV1lNPBtvasls',1209600,NULL,'2018-06-14 00:52:25',9),('BlTcmvIfANNifOFvhvHTDLcppaDb5zm93DyrNtzX0EwDPoIG9iEnH5dBh6JyROef',1209600,NULL,'2018-06-14 00:56:59',9),('ceOqverpmlMFoyR0jN4gzYsfjKDxUGnpur2IGP7BhEkxnDCUfYJaOD5eIcPusduX',1209600,NULL,'2018-06-14 00:37:39',9),('D1s7iD6VXHd93YpQiQsRaVsmClJTTUQXmlFKj26A8dRmSXg7i7eYMPgauwji96BK',1209600,NULL,'2018-06-14 00:04:14',9),('d411dH90kIDBcgJzNFUVf2nnZCzu8ohj0UIFKkbOVNl86CiHQqGZIrc4JIoT5hJ8',1209600,NULL,'2018-06-29 15:16:33',19),('dkZvVizQDgC1Nwoe5rz34GG1BTUeZLpjlMzvRVdBHSspcLe8pF8MIykJ1InYXjuA',1209600,NULL,'2018-06-14 01:03:01',9),('DUlyDufbzF8VBaDADNxh8ZlzZpqArFfopud4L1EB7ef64A1f0reXFR38ob6L5BsF',1209600,NULL,'2018-06-30 12:52:28',18),('EMDhHrYCkFzvOatcxXqmlMm3Eh20xts5kdO70j1nDqIFVE8onmcCgHEUSqkdqI7t',1209600,NULL,'2018-06-13 23:34:22',7),('eOT3rnoNTR0QKf8AOyXe5u7s0eNJp1UcqlXQkeaiSdPAEGunb6x7OGsALump52Ny',1209600,NULL,'2018-06-14 00:49:56',9),('FG263bG6cjSAQmIkKgA0j7e68FeRMtJF02ZyAb05G4gJGXb1bVhvjBG54OVHmFi3',1209600,NULL,'2018-06-14 01:03:00',9),('fZ1HdPeFQBubXPGVopGwFpBQML9IGKsRY9r1yTwBs9s2lMLVQQWfOqQM6mxQ2wNy',1209600,NULL,'2018-06-14 01:03:39',9),('gQwxYh7raDiLP0zsMvEmD4NPxVAQOCxbo8ZrUKr724F0oHsuz8OEyaJjlt8u80SH',1209600,NULL,'2018-06-14 01:02:28',9),('iHPdFfFAxLAHy9m6Uu2Qb06R7xYE2elNb2lhLh78lQ4yZCOwVHZFeLslu7VRFM6t',1209600,NULL,'2018-06-13 23:32:56',7),('ImcAV0pEM7HR02WNXI9zIIHAiFCrhUo8BN3MvaAfBGoMnzN8rwEv71oJzsYDlZV4',1209600,NULL,'2018-06-13 16:07:42',7),('iTU5aNPHEbWfLfZnfyd1cpKQYckeVgN6GMdk8xQaHEeJqCehB8Mi3AAZ4GpitfQX',1209600,NULL,'2018-06-13 16:07:47',7),('JFLJ8YSC6yrXO6XrMpmwTq6bOYE6EDdAGFpOSJ16jJZTMlf3XLLA8E0HSKBQKJ7S',1209600,NULL,'2018-06-13 23:59:17',9),('JFNMLTl8D5IixBlTDWIQcjhLGfc3wDypLlwjh1l1Ng5ZyJLS2OtMR9RDsvDD0bQD',1209600,NULL,'2018-06-13 16:07:46',7),('jG5hoFICmuA5CXFaift7V3bFC3rGax6xN9lbcKY8bv5SaLA94XKO64IY5VwR0iAq',1209600,NULL,'2018-06-14 00:23:03',9),('jzetotcvEVhEBPvmUuAOUQEG0SXPRW8TfbBFdcItWIHvnzVjTGMOCWlxNhkxYeXF',1209600,NULL,'2018-06-29 09:20:37',19),('kdMnOUU240LU66G6Hv4yOlcrL9DvJ2925455GfQu7IVNsGVXlKhsmo0MbITYaF1Z',1209600,NULL,'2018-06-14 01:01:53',9),('KhH7P38mv0GmqCzCsNhzx5HnCv6UY5JXkr5hIqDI2HvmAZH3BnG8aDnmWjH382D7',1209600,NULL,'2018-06-30 12:51:38',18),('LC0tqBvfHL7hyqBIWdmg6qQbw4uxt6eFEu2Kjn1LI6jt1Qj1MaDS9qA9h8YlWiHh',1209600,NULL,'2018-06-14 00:58:00',9),('LrdAdJmx2pGRLQG4A9ZaDsM0t5XvyXpd3e1qLVVl3YHbY53tpG5hK9uCnfCDYmRV',1209600,NULL,'2018-06-14 00:48:09',9),('n2P6bMnzaAwDiApeWcM5keksaNpeapMTvDqZ55cM5aYmVBiDM3R4oVkzNpFYhbUc',1209600,NULL,'2018-06-14 00:09:05',9),('NcjtJM39NNGckw1tCcsA0iKH5A014ipQtiqhTxJqf17FCUVjfWPHfPdcXSOZF3IB',1209600,NULL,'2018-06-14 00:47:28',9),('nyaYyGQfIOZNNQdXNnCJiN3rrrvjnC4aw9jq9cK7lhGP1mP3G2Pm71XfWpmBFsDF',1209600,NULL,'2018-06-14 00:56:24',9),('QcVyk1ZY2UoMEVOrcjTzq1FMhKeF1j2yNPPrIiI2yQDXG2BwjLrjiPghxcTj5SVx',1209600,NULL,'2018-06-14 00:02:48',9),('qt7qabtUBrRV7OEDWy866pRMXFYGLXEzERDc0U4EJFq1crk75gLvazgl60J82Hhy',1209600,NULL,'2018-06-14 00:49:07',9),('rIiZIRr2JFRChD0TMeEmx2lfKZWPzAkfAfP15utbBBOaUjbslXqo6Jr5jhVmE4fz',1209600,NULL,'2018-06-29 15:16:53',19),('RT9uMhfz03ERTvzblcvKQy21YoZHZKSU4o3sAzTXuqSo1kbohxUkEHCAeqyXHD1B',1209600,NULL,'2018-06-29 09:20:08',19),('SlpuVZezMvOEWZaXSgMSMqCSP438LOOsA8dvJmwFmhpPRlDfEx8ynxoHoV9etGpL',1209600,NULL,'2018-06-14 00:23:06',9),('srQGOu9srv5y6IjGXr1HcLFIY6G8ULGIQF1G8ToNgdU2aosGyV6UWOSHrR3rgq77',1209600,NULL,'2018-06-28 22:30:07',19),('Thhh5q43RzkwycDrEXhEbRVgLAvfD8g821zZLaZJDYil30UiLhqebA6pCJw5prpY',1209600,NULL,'2018-06-14 00:42:28',9),('tV8KkRoVT9pknEMeIQPhOCDw4AN9hXXF7ek3UHQBF53KYBgRbIB4Zw0uw88vSpNJ',1209600,NULL,'2018-06-14 01:01:20',9),('Ue5xrJUrxwCCGmkE55rsOhZvcXple5FKr5zXPT9ESgstXv1Utv4FWAQBstwktEe2',1209600,NULL,'2018-06-14 00:53:18',9),('VgXRZ0sv0HDcG9h6W7Vg0XBcfBILQTnzeQMpJQBjz5b10HKeUtzWIYVj9JRMbt5w',1209600,NULL,'2018-06-14 00:51:51',9),('vqwhj6rx6w2YgNKR4WmmTGDGL1DXh0o5VByKtObKRgfcC5nBA1R9XvTJVHfmDTqK',1209600,NULL,'2018-06-10 07:15:13',1),('Vshm34CKuLbKEGthtlZItGHAuIndXEn21hDw62wk2C45IluyPtzkKYhwzZLquN4h',1209600,NULL,'2018-06-14 00:05:11',9),('VtbwLCfYmpwXDbU3D7zKBp592a2VqwfVOIbj0pvBAeOEKhti7PlECJfCYVVqaaBa',1209600,NULL,'2018-06-14 00:46:47',9),('w9CIY0NNZuiu7iMoeEa1hHadH07LgqYhJ8WH8ngm64UnyUGiu2brNLR1l6YK6eKv',1209600,NULL,'2018-06-14 01:02:26',9),('x2sdBnr3TxaEFxGAMG6Pv1BEFA6Jl3W9IWBjhT8zV64u5mfAaR2U9osvcuIu8SCw',1209600,NULL,'2018-06-29 09:20:19',19),('XHc12w1R0ByXARA2FZc4zG0wiWP5RRoHB0XlZxS5R8XuIHqafIkaAZu1JqX3OcrB',1209600,NULL,'2018-06-14 01:06:09',9),('XXQcffdNXjMujFGtggAypSlEdtEFyHSw3CJHNU1Nn9PJgAl2O5eEFrDd8AgOu55O',1209600,NULL,'2018-06-13 16:06:10',7),('yJNGbLOeHIYj3CrTeVe8K6xBBLR0r0PhrZHTry9Az7rh1xL9E6wA6vhWgV7O4HYB',1209600,NULL,'2018-06-13 23:27:23',7),('Yl4nn6kKBV98pF6yqQsbtYNexYEDhvMJPmvkVHU7mlgjHnZouzgY1vEXg08PicLF',1209600,NULL,'2018-06-13 16:14:03',7);
/*!40000 ALTER TABLE `AccessToken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client`
--

-- DROP TABLE IF EXISTS `client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `realm` varchar(512) DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `password` varchar(512) NOT NULL,
  `email` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL,
  `mobile` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `birthdate` varchar(255) NOT NULL,
  `profession` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client`
--

LOCK TABLES `client` WRITE;
/*!40000 ALTER TABLE `client` DISABLE KEYS */;
INSERT INTO `client` VALUES (1,'amer','ameralhosary','$2a$10$GBCsXuN.QUwOSeP8d.NLeeiC9oLxwn4UdpY8LsPkeKWp2f4.moU3W','a@a.com',1,NULL,'0962554805','','',''),(2,'amer2','ameralhosary2','$2a$10$.4asT7C1rRPQsSVqZnF85ur7e4WSgiBPpx4tnrAL9qMWSKcTyi/nm','amer.alhosary@gmail.com',0,NULL,'0962554805','','',''),(7,'amer3','ameralhosary3','$2a$10$GASourSgxDzTwdWC/s8JCONeRvsv2Z3vRuiiIUG9KOHck3RUuV4aK','amer.signinn@gmail.com',0,NULL,'0962554805','','',''),(9,'amer4','ameralhosary4','$2a$10$4Br.WJLdvzTfzVtKm/ujm.Xv/EHGdtLCRmISTFuuHwe6bdKSINeay','amer.signinn1@gmail.com',0,NULL,'0962554805','','',''),(10,'amer4','ameralhosary5','$2a$10$CqGNOBxgg3bwVptMuSzVf.pXwkq0brwrY24tkhQvGvbSs90NbdMJG','amer.signinn3@gmail.com',0,NULL,'0962554805','','',''),(11,'amer4','ameralhosary6','$2a$10$5xJSCK7HnCRpPHviu9wJZuQMbIkC/hPzsOq4u1IO6/TCswdGPqU8O','amer.signinn5@gmail.com',0,'130984','0962554805','','',''),(12,'amer4','ameralhosary7','$2a$10$dyOSJF6SHn4xQncTEqr4e.n1T0kwV1CHcdNRK4T2j17TWix4fOL1C','amer.signinn7@gmail.com',1,NULL,'0962554805','','',''),(13,'amr','ameral','$2a$10$mZnOromFV4N1r3li1f.qm.EWfzXn6IOPN04nvYh6nKCDwXXLmgxmm','aa@aa.com',0,'304747','0962554805','male','12-6-1993','aa'),(14,'amral','ameralho','$2a$10$h32TUtvMDhZ3EgWwM29OoOUn.bPBXIFNiUi7MXXcXTa55xVvzrgru','aa@aaaa.com',0,'448401','0962554805','male','12-6-1993','aa'),(15,'amral','ameralhosa','$2a$10$3mm9UUYCtXfLdTiBsyhvseHcWH4qaa.1eglLXvME1/C.2Y6dR59X.','aaaa@aaaa.com',0,'594820','0962554805','male','12-6-1993','aa'),(16,'string','string','$2a$10$Ff8Tp.TaGUcV8q93ODo58.WK2MeW7ImBu6W2WaYYFoxoeHnQYwDtO','string@mail.com',0,'787650','095744444','gender','25/6/2018','string'),(17,NULL,'anooos','$2a$10$TGAu7srLDXp2GGD5Of.juOc/EMTt4ZvUF5uYjD8PzChDnHVZzgqvO','anoos@mail.com',0,'054213','09577777','ذكر','25/6/2018','1'),(18,NULL,'anoos','$2a$10$Mio/fiT41gGGy3sl3m6JsOcIzTc3vdXEcP/aEHuret5rVztP1Boom','anas@mail.com',0,'988197','0957465876','أنثى','25/6/2018','1'),(19,'reg','molTest','$2a$10$z0i8W4lLCHvY/56.qL26C.q4OnyYJ1aHPFZ8wdRrPSeTLT/27mm0a','fatherboard1@gmail.com',1,NULL,'00963933074900','male','1991-04-12T17:50:00.586Z','engineer');
/*!40000 ALTER TABLE `client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nas`
--

-- DROP TABLE IF EXISTS `nas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `nas` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `nasname` varchar(128) NOT NULL,
  `shortname` varchar(32) DEFAULT NULL,
  `type` varchar(30) DEFAULT 'other',
  `ports` int(5) DEFAULT NULL,
  `secret` varchar(60) NOT NULL DEFAULT 'secret',
  `server` varchar(64) DEFAULT NULL,
  `community` varchar(50) DEFAULT NULL,
  `description` varchar(200) DEFAULT 'RADIUS Client',
  PRIMARY KEY (`id`),
  KEY `nasname` (`nasname`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nas`
--

LOCK TABLES `nas` WRITE;
/*!40000 ALTER TABLE `nas` DISABLE KEYS */;
/*!40000 ALTER TABLE `nas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radacct`
--

-- DROP TABLE IF EXISTS `radacct`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `radacct` (
  `radacctid` bigint(21) NOT NULL AUTO_INCREMENT,
  `acctsessionid` varchar(64) NOT NULL DEFAULT '',
  `acctuniqueid` varchar(32) NOT NULL DEFAULT '',
  `username` varchar(64) NOT NULL DEFAULT '',
  `realm` varchar(64) DEFAULT '',
  `nasipaddress` varchar(15) NOT NULL DEFAULT '',
  `nasportid` varchar(15) DEFAULT NULL,
  `nasporttype` varchar(32) DEFAULT NULL,
  `acctstarttime` datetime DEFAULT NULL,
  `acctupdatetime` datetime DEFAULT NULL,
  `acctstoptime` datetime DEFAULT NULL,
  `acctinterval` int(12) DEFAULT NULL,
  `acctsessiontime` int(12) unsigned DEFAULT NULL,
  `acctauthentic` varchar(32) DEFAULT NULL,
  `connectinfo_start` varchar(50) DEFAULT NULL,
  `connectinfo_stop` varchar(50) DEFAULT NULL,
  `acctinputoctets` bigint(20) DEFAULT NULL,
  `acctoutputoctets` bigint(20) DEFAULT NULL,
  `calledstationid` varchar(50) NOT NULL DEFAULT '',
  `callingstationid` varchar(50) NOT NULL DEFAULT '',
  `acctterminatecause` varchar(32) NOT NULL DEFAULT '',
  `servicetype` varchar(32) DEFAULT NULL,
  `framedprotocol` varchar(32) DEFAULT NULL,
  `framedipaddress` varchar(15) NOT NULL DEFAULT '',
  PRIMARY KEY (`radacctid`),
  UNIQUE KEY `acctuniqueid` (`acctuniqueid`),
  KEY `username` (`username`),
  KEY `framedipaddress` (`framedipaddress`),
  KEY `acctsessionid` (`acctsessionid`),
  KEY `acctsessiontime` (`acctsessiontime`),
  KEY `acctstarttime` (`acctstarttime`),
  KEY `acctinterval` (`acctinterval`),
  KEY `acctstoptime` (`acctstoptime`),
  KEY `nasipaddress` (`nasipaddress`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radacct`
--

LOCK TABLES `radacct` WRITE;
/*!40000 ALTER TABLE `radacct` DISABLE KEYS */;
/*!40000 ALTER TABLE `radacct` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radcheck`
--

-- DROP TABLE IF EXISTS `radcheck`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `radcheck` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL DEFAULT '',
  `attribute` varchar(64) NOT NULL DEFAULT '',
  `op` char(2) NOT NULL DEFAULT '==',
  `value` varchar(253) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `username` (`username`(32))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;



--
-- Table structure for table `radgroupcheck`
--

-- DROP TABLE IF EXISTS `radgroupcheck`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `radgroupcheck` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `groupname` varchar(64) NOT NULL DEFAULT '',
  `attribute` varchar(64) NOT NULL DEFAULT '',
  `op` char(2) NOT NULL DEFAULT '==',
  `value` varchar(253) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `groupname` (`groupname`(32))
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radgroupcheck`
--

LOCK TABLES `radgroupcheck` WRITE;
/*!40000 ALTER TABLE `radgroupcheck` DISABLE KEYS */;
/*!40000 ALTER TABLE `radgroupcheck` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radgroupreply`
--

-- DROP TABLE IF EXISTS `radgroupreply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `radgroupreply` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `groupname` varchar(64) NOT NULL DEFAULT '',
  `attribute` varchar(64) NOT NULL DEFAULT '',
  `op` char(2) NOT NULL DEFAULT '=',
  `value` varchar(253) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `groupname` (`groupname`(32))
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radgroupreply`
--

LOCK TABLES `radgroupreply` WRITE;
/*!40000 ALTER TABLE `radgroupreply` DISABLE KEYS */;
/*!40000 ALTER TABLE `radgroupreply` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radpostauth`
--

-- DROP TABLE IF EXISTS `radpostauth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `radpostauth` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL DEFAULT '',
  `pass` varchar(64) NOT NULL DEFAULT '',
  `reply` varchar(32) NOT NULL DEFAULT '',
  `authdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radpostauth`
--

LOCK TABLES `radpostauth` WRITE;
/*!40000 ALTER TABLE `radpostauth` DISABLE KEYS */;
/*!40000 ALTER TABLE `radpostauth` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radreply`
--

-- DROP TABLE IF EXISTS `radreply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `radreply` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL DEFAULT '',
  `attribute` varchar(64) NOT NULL DEFAULT '',
  `op` char(2) NOT NULL DEFAULT '=',
  `value` varchar(253) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `username` (`username`(32))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radreply`
--

LOCK TABLES `radreply` WRITE;

UNLOCK TABLES;

--
-- Table structure for table `radusergroup`
--

-- DROP TABLE IF EXISTS `radusergroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `radusergroup` (
  `username` varchar(64) NOT NULL DEFAULT '',
  `groupname` varchar(64) NOT NULL DEFAULT '',
  `priority` int(11) NOT NULL DEFAULT '1',
  KEY `username` (`username`(32))
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radusergroup`
--

LOCK TABLES `radusergroup` WRITE;
/*!40000 ALTER TABLE `radusergroup` DISABLE KEYS */;
/*!40000 ALTER TABLE `radusergroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

-- DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(512) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolemapping`
--

-- DROP TABLE IF EXISTS `rolemapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `rolemapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `principalType` varchar(512) DEFAULT NULL,
  `principalId` varchar(255) DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `principalId` (`principalId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolemapping`
--

LOCK TABLES `rolemapping` WRITE;
/*!40000 ALTER TABLE `rolemapping` DISABLE KEYS */;
/*!40000 ALTER TABLE `rolemapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

-- DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `realm` varchar(512) DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `password` varchar(512) NOT NULL,
  `email` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL,
  `mobile` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-07-01 17:33:16
