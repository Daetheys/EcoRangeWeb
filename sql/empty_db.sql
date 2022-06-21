--  phpMyAdmin SQL Dump
--  version 4.0.10.6
--  http://www.phpmyadmin.net
-- 
--  Host: mysql-risc.alwaysdata.net
--  Generation Time: Oct 09, 2017 at 04:56 PM
--  Server version: 10.1.23-MariaDB
--  PHP Version: 5.6.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


--  *!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
--  *!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
--  *!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
--  *!40101 SET NAMES utf8 */;

-- 
--  Database: `risc_human_rl`
-- 

--  -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 

--
--  Table structure for table `exp`
-- --

 CREATE TABLE IF NOT EXISTS `nicolas_ecorange_exp` (
 `EXPID` varchar(20) NOT NULL,
 `ID` varchar(100) NOT NULL,
 `EXP` varchar(20) NOT NULL,
 `BROW` text NOT NULL,
 `MINREWS` varchar(500) NOT NULL,
 `MAXREWS` varchar(500) NOT NULL,
 `NSEASONS` int(10) NOT NULL,
 `NTRIALSPERSEASON` int(10) NOT NULL,
 `NARMS` int(10) NOT NULL,
 `DBTIME` datetime NOT NULL
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
 --  -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 

-- 
--  Table structure for table `season`
-- 
 
  CREATE TABLE IF NOT EXISTS `nicolas_ecorange_season` (
 `EXPID` varchar(20) NOT NULL,
 `ID` varchar(100) NOT NULL,
 `EXP` varchar(20) NOT NULL,
 `MINREW` int(10) NOT NULL,
 `MAXREW` int(10) NOT NULL,
 `RANKS` varchar(500) NOT NULL,
 `REWARDS` varchar(500) NOT NULL,
 `SEASONID` int(10) NOT NULL,
 `DBTIME` datetime NOT NULL
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--  -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 

-- 
--  Table structure for table `learning_data`
-- 

CREATE TABLE IF NOT EXISTS `nicolas_ecorange_data` (
`EXP` varchar(20) NOT NULL,
`EXPID` varchar(20) NOT NULL,
`ID` varchar(100) NOT NULL,
`TEST` int(11) NOT NULL,
`SEASON` int(10) NOT NULL,
`CHOICE` int(10) NOT NULL,
`TRIAL` int(11) NOT NULL,
`REW` int(10) NOT NULL,
`RANK` int(10) NOT NULL,
`RTIME` double NOT NULL,
`REWTOT` int(10) NOT NULL,
`SESSION` int(11) NOT NULL,
`CTIME` bigint(20) NOT NULL,
`DBTIME` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
