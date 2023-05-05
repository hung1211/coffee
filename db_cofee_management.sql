-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3309
-- Generation Time: May 03, 2023 at 06:07 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.0.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_cofee_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `rolename` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_pages`
--

CREATE TABLE `role_pages` (
  `roleid` int(11) NOT NULL,
  `pagerole` varchar(50) NOT NULL DEFAULT '',
  `viewrole` tinyint(1) NOT NULL DEFAULT 0,
  `editrole` tinyint(1) NOT NULL DEFAULT 0,
  `deleterole` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_area`
--

CREATE TABLE `tb_area` (
  `AreaID` int(11) NOT NULL,
  `AreaName` varchar(255) NOT NULL,
  `Description` varchar(1000) NOT NULL,
  `ImageUrl` varchar(1000) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `DeletedDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_brand`
--

CREATE TABLE `tb_brand` (
  `BrandID` int(11) NOT NULL,
  `BrandName` varchar(255) NOT NULL,
  `Description` varchar(1000) NOT NULL,
  `Address` varchar(255) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_category`
--

CREATE TABLE `tb_category` (
  `ID` int(11) NOT NULL,
  `CategoryName` varchar(255) NOT NULL,
  `ImageUrl` varchar(5000) NOT NULL,
  `Description` varchar(1000) NOT NULL,
  `Discount` smallint(200) NOT NULL DEFAULT 0,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_current_order`
--

CREATE TABLE `tb_current_order` (
  `TableID` int(11) NOT NULL,
  `TableName` varchar(255) NOT NULL,
  `AreaID` int(11) NOT NULL,
  `ProductList` varchar(5000) NOT NULL,
  `ProductIDList` varchar(500) NOT NULL,
  `TotalPrice` double NOT NULL DEFAULT 0,
  `CreateTime` datetime DEFAULT NULL,
  `Status` tinyint(1) NOT NULL DEFAULT 0,
  `IsDeleted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_importgoods`
--

CREATE TABLE `tb_importgoods` (
  `ImportID` int(11) NOT NULL,
  `BrandID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `UnitPrice` double NOT NULL,
  `ImportDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_order`
--

CREATE TABLE `tb_order` (
  `OrderID` int(11) NOT NULL,
  `TableID` int(11) NOT NULL,
  `TableName` varchar(255) NOT NULL,
  `Discount` smallint(200) NOT NULL DEFAULT 0,
  `CustomerID` int(11) NOT NULL,
  `CreateTime` datetime NOT NULL DEFAULT current_timestamp(),
  `LeaveTime` datetime NOT NULL,
  `PaymentMethod` tinyint(20) NOT NULL,
  `Status` tinyint(20) NOT NULL,
  `TotalPrice` double NOT NULL,
  `OrderDetails` varchar(5000) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `OrderCode` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Triggers `tb_order`
--
DELIMITER $$
CREATE TRIGGER `auto_insert_to_tb_total_in_day` AFTER INSERT ON `tb_order` FOR EACH ROW INSERT INTO tb_total_in_day (date_, TotalPrice) VALUE(date(New.CreateTime), New.TotalPrice) ON DUPLICATE KEY UPDATE TotalPrice = TotalPrice + VALUES(TotalPrice)
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `auto_update_to_tb_total_price` AFTER UPDATE ON `tb_order` FOR EACH ROW IF (New.IsDeleted = 1) THEN

UPDATE tb_total_in_day SET TotalPrice = TotalPrice - OLD.TotalPrice WHERE date(date_) = date(OLD.CreateTime);

END IF
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `tb_orderdetails`
--

CREATE TABLE `tb_orderdetails` (
  `OrderDetailsID` int(11) NOT NULL,
  `OrderID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `Price` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_product`
--

CREATE TABLE `tb_product` (
  `ProductID` int(11) NOT NULL,
  `ProductName` varchar(255) NOT NULL,
  `CategoryID` int(11) NOT NULL,
  `Description` varchar(1000) NOT NULL,
  `ImageUrl` varchar(2048) NOT NULL,
  `Price` double NOT NULL,
  `Discount` smallint(200) NOT NULL DEFAULT 0,
  `BrandID` int(11) NOT NULL,
  `Remain` int(11) NOT NULL DEFAULT 0,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_system`
--

CREATE TABLE `tb_system` (
  `id` int(11) NOT NULL,
  `system_name` varchar(100) NOT NULL,
  `system_value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tb_table`
--

CREATE TABLE `tb_table` (
  `TableID` int(11) NOT NULL,
  `TableName` varchar(255) NOT NULL,
  `AreaID` int(11) NOT NULL DEFAULT 0,
  `IsDeleted` tinyint(1) NOT NULL,
  `DeletedDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Triggers `tb_table`
--
DELIMITER $$
CREATE TRIGGER `auto_delete_table_to_current_order` AFTER DELETE ON `tb_table` FOR EACH ROW DELETE FROM tb_current_order WHERE TableID = OLD.TableID
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `auto_insert_table_to_current_order` AFTER INSERT ON `tb_table` FOR EACH ROW INSERT INTO tb_current_order (TableID, TableName, AreaID) VALUES (NEW.TableID, NEW.TableName, NEW.AreaID)
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `auto_update_table_to_current_order` AFTER UPDATE ON `tb_table` FOR EACH ROW UPDATE tb_current_order SET TableName = NEW.TableName, AreaID = NEW.AreaID, IsDeleted = NEW.IsDeleted WHERE TableID = NEW.TableID
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `tb_total_in_day`
--

CREATE TABLE `tb_total_in_day` (
  `date_` datetime NOT NULL,
  `TotalPrice` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fname` varchar(50) NOT NULL,
  `lname` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(200) NOT NULL,
  `wrongcount` tinyint(4) NOT NULL DEFAULT 0,
  `role` tinyint(4) NOT NULL DEFAULT 0,
  `last_login` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role_pages`
--
ALTER TABLE `role_pages`
  ADD PRIMARY KEY (`roleid`,`pagerole`);

--
-- Indexes for table `tb_area`
--
ALTER TABLE `tb_area`
  ADD PRIMARY KEY (`AreaID`);

--
-- Indexes for table `tb_brand`
--
ALTER TABLE `tb_brand`
  ADD PRIMARY KEY (`BrandID`);

--
-- Indexes for table `tb_category`
--
ALTER TABLE `tb_category`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `tb_current_order`
--
ALTER TABLE `tb_current_order`
  ADD PRIMARY KEY (`TableID`);

--
-- Indexes for table `tb_importgoods`
--
ALTER TABLE `tb_importgoods`
  ADD PRIMARY KEY (`ImportID`);

--
-- Indexes for table `tb_order`
--
ALTER TABLE `tb_order`
  ADD PRIMARY KEY (`OrderID`);

--
-- Indexes for table `tb_orderdetails`
--
ALTER TABLE `tb_orderdetails`
  ADD PRIMARY KEY (`OrderDetailsID`);

--
-- Indexes for table `tb_product`
--
ALTER TABLE `tb_product`
  ADD PRIMARY KEY (`ProductID`);

--
-- Indexes for table `tb_system`
--
ALTER TABLE `tb_system`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_system_name` (`system_name`);

--
-- Indexes for table `tb_table`
--
ALTER TABLE `tb_table`
  ADD PRIMARY KEY (`TableID`);

--
-- Indexes for table `tb_total_in_day`
--
ALTER TABLE `tb_total_in_day`
  ADD PRIMARY KEY (`date_`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Primary_key_user` (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_area`
--
ALTER TABLE `tb_area`
  MODIFY `AreaID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_brand`
--
ALTER TABLE `tb_brand`
  MODIFY `BrandID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_category`
--
ALTER TABLE `tb_category`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_importgoods`
--
ALTER TABLE `tb_importgoods`
  MODIFY `ImportID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_order`
--
ALTER TABLE `tb_order`
  MODIFY `OrderID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_orderdetails`
--
ALTER TABLE `tb_orderdetails`
  MODIFY `OrderDetailsID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_product`
--
ALTER TABLE `tb_product`
  MODIFY `ProductID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_system`
--
ALTER TABLE `tb_system`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tb_table`
--
ALTER TABLE `tb_table`
  MODIFY `TableID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
