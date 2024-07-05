-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 05, 2024 at 03:09 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vaccine_reminder`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `appointment_booked_by` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `appointment_time` time NOT NULL,
  `appointment_date` date NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `prescription_details` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `appointment_booked_by`, `patient_id`, `appointment_time`, `appointment_date`, `is_completed`, `prescription_details`, `status`, `created_by`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 7, 9, '07:38:00', '2024-05-24', 1, 'You need to take 8 hours of sleep, and drink a plenty of water (Approx 10 liters per day)', 1, 7, '2024-05-14', NULL, 0),
(2, 19, 1, '00:00:08', '2024-05-31', 0, NULL, 1, 2, '2024-05-29', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `clinic_info`
--

CREATE TABLE `clinic_info` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `address` text NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clinic_info`
--

INSERT INTO `clinic_info` (`id`, `doctor_id`, `name`, `description`, `address`, `status`, `created_by`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 6, 'Kamla Clinic', 'This is a test', 'Medical college Sagar', 1, 4, '2024-05-16', NULL, 0),
(2, 6, 'Eye test Clinic', 'This is a test', 'Medical college Sagar', 1, 4, '2024-05-16', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `doctor_master_vaccine_template`
--

CREATE TABLE `doctor_master_vaccine_template` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor_master_vaccine_template`
--

INSERT INTO `doctor_master_vaccine_template` (`id`, `doctor_id`, `name`, `description`, `status`, `created_by`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 53, 'template Corona1', 'This is a test template', 1, 1, '2024-07-05', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `doctor_master_vaccine_template_vaccines`
--

CREATE TABLE `doctor_master_vaccine_template_vaccines` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `master_vaccine_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `vaccine_range` varchar(255) NOT NULL COMMENT 'range after date of birth',
  `range_type` enum('days','weeks','months','years') NOT NULL,
  `version_number` varchar(50) NOT NULL,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 for not mandatory, 1 for mandatory',
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor_master_vaccine_template_vaccines`
--

INSERT INTO `doctor_master_vaccine_template_vaccines` (`id`, `doctor_id`, `master_vaccine_id`, `name`, `description`, `vaccine_range`, `range_type`, `version_number`, `is_mandatory`, `status`, `created_by`, `created_date`, `updated_date`, `updated_by`, `is_deleted`) VALUES
(1, 53, 1, 'Vaccine Polio', 'Description for Vaccine Polio', '1-2', 'months', '1', 1, 1, 1, '2024-07-05', NULL, NULL, 0),
(2, 53, 1, 'Vaccine Rabbies', 'Description for Vaccine Rabbies', '2-3', 'weeks', '1', 0, 1, 1, '2024-07-05', NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `doctor_time_slots`
--

CREATE TABLE `doctor_time_slots` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `time_slot` varchar(100) NOT NULL,
  `shift_day_number` tinyint(1) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor_time_slots`
--

INSERT INTO `doctor_time_slots` (`id`, `doctor_id`, `time_slot`, `shift_day_number`, `status`, `created_by`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 6, '10:00 A.M to 2:00 P.M.', 1, 1, 1, '2024-05-23', NULL, 0),
(2, 7, '10:00 A.M to 2:20 P.M.', 1, 1, 1, '2024-05-23', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `doctor_unavailability_info`
--

CREATE TABLE `doctor_unavailability_info` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `unavailibility_date_from` date NOT NULL,
  `unavailibility_date_to` date NOT NULL,
  `reason_of_unavaility` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `deleted_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `event_description` text NOT NULL,
  `event_date` date NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `event_name`, `event_description`, `event_date`, `status`, `created_by`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 'Event1 Updated', 'This is updated description', '2024-07-22', 1, 26, '2024-07-04', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `master_vaccine_template`
--

CREATE TABLE `master_vaccine_template` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `master_vaccine_template`
--

INSERT INTO `master_vaccine_template` (`id`, `name`, `description`, `status`, `created_by`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 'template Corona1', 'This is a test template', 1, 1, '2024-07-05', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `master_vaccine_template_vaccines`
--

CREATE TABLE `master_vaccine_template_vaccines` (
  `id` int(11) NOT NULL,
  `master_vaccine_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `vaccine_range` varchar(11) NOT NULL COMMENT 'Range after date of birth',
  `range_type` enum('days','weeks','months','years') NOT NULL,
  `version_number` varchar(50) NOT NULL,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 for not mandatory, 1 for mandatory',
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `master_vaccine_template_vaccines`
--

INSERT INTO `master_vaccine_template_vaccines` (`id`, `master_vaccine_id`, `name`, `description`, `vaccine_range`, `range_type`, `version_number`, `is_mandatory`, `status`, `created_by`, `created_date`, `updated_date`, `is_deleted`) VALUES
(5, 1, 'Vaccine Polio', 'Description for Vaccine Polio', '1-2', 'months', '1', 1, 1, 1, '2024-07-05', NULL, 0),
(6, 1, 'Vaccine Rabbies', 'Description for Vaccine Rabbies', '2-3', 'weeks', '1', 0, 1, 1, '2024-07-05', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int(11) NOT NULL,
  `module_name` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `module_name`, `status`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 'superadmin', 1, '2024-07-01', NULL, 0),
(2, 'admin', 1, '2024-07-01', NULL, 0),
(3, 'doctor', 1, '2024-07-01', NULL, 0),
(4, 'staff', 1, '2024-07-01', NULL, 0),
(5, 'patient', 1, '2024-07-01', NULL, 0),
(6, 'appointment', 1, '2024-07-01', NULL, 0),
(7, 'notification', 1, '2024-07-01', NULL, 0),
(8, 'event', 1, '2024-07-01', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `notification_message` text NOT NULL,
  `notification_to` int(11) NOT NULL COMMENT 'role_id',
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `notification_message`, `notification_to`, `status`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 'Hey admins!', 2, 1, '2024-05-16', NULL, 1),
(2, 'Hello doctors!', 3, 1, '2024-05-16', NULL, 1),
(3, 'Hello all', 3, 1, '2024-05-29', NULL, 1),
(4, 'Hello doctors fsdfsdfsf!', 2, 1, '2024-05-16', NULL, 1),
(5, 'Hello doctors hfghfghfgh!', 2, 1, '2024-05-16', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `master_id` int(11) NOT NULL COMMENT 'Doctor or staff id',
  `mobile_number` varchar(12) NOT NULL,
  `name` varchar(255) NOT NULL,
  `gender` enum('M','F','O') NOT NULL,
  `date_of_birth` date NOT NULL,
  `vaccine_ids` varchar(255) NOT NULL COMMENT 'Comma separated string of vaccine ids',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 for active, 0 for deactive',
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `parent_id`, `master_id`, `mobile_number`, `name`, `gender`, `date_of_birth`, `vaccine_ids`, `status`, `created_by`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 0, 6, '7777777777', 'Vishal Das', 'M', '2024-05-17', '1,2', 1, 6, '2024-06-11', NULL, 0),
(2, 0, 43, '7777777777', 'Priya verma', 'F', '2024-06-17', '1,2', 1, 43, '2024-06-11', NULL, 0),
(3, 0, 43, '7777777777', 'Priya verma', 'F', '2024-06-17', '1,2', 1, 43, '2024-06-11', NULL, 0),
(4, 0, 43, '7777777777', 'Priya verma', 'F', '2024-06-17', '1,2', 1, 43, '2024-06-11', NULL, 0),
(5, 0, 43, '7777777777', 'Priya verma', 'F', '2024-06-17', '1,2', 1, 43, '2024-06-11', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `patients_parent`
--

CREATE TABLE `patients_parent` (
  `id` int(11) NOT NULL,
  `master_id` int(11) NOT NULL,
  `mobile_number` varchar(12) NOT NULL,
  `name` varchar(255) NOT NULL,
  `gender` enum('M','F','O') NOT NULL,
  `date_of_birth` date NOT NULL,
  `vaccine_ids` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patient_vaccination_info`
--

CREATE TABLE `patient_vaccination_info` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `vaccine_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `vaccination_start_date` date NOT NULL,
  `vaccination_end_date` date NOT NULL,
  `vaccinated_status` tinyint(1) NOT NULL DEFAULT 0,
  `attachment` varchar(255) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patient_vaccination_info`
--

INSERT INTO `patient_vaccination_info` (`id`, `patient_id`, `vaccine_id`, `doctor_id`, `vaccination_start_date`, `vaccination_end_date`, `vaccinated_status`, `attachment`, `status`, `created_by`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 1, 1, 6, '2024-06-17', '2024-07-17', 1, NULL, 1, 6, '2024-06-11', NULL, 0),
(2, 1, 2, 6, '2024-05-31', '2024-06-07', 0, NULL, 1, 6, '2024-06-11', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_role_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `module_name` varchar(255) NOT NULL,
  `create_permission` tinyint(1) NOT NULL,
  `read_permission` tinyint(1) NOT NULL,
  `update_permission` tinyint(1) NOT NULL,
  `delete_permission` tinyint(1) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `user_id`, `user_role_id`, `module_id`, `module_name`, `create_permission`, `read_permission`, `update_permission`, `delete_permission`, `status`, `created_by`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 44, 3, 1, 'superadmin', 0, 0, 0, 0, 1, 1, '2024-07-02', NULL, 0),
(2, 44, 3, 2, 'admin', 0, 0, 0, 0, 1, 1, '2024-07-02', NULL, 0),
(3, 44, 3, 3, 'doctor', 0, 0, 0, 0, 1, 1, '2024-07-02', NULL, 0),
(4, 44, 3, 4, 'staff', 0, 0, 0, 0, 1, 1, '2024-07-02', NULL, 0),
(5, 44, 3, 5, 'patient', 0, 0, 0, 0, 1, 1, '2024-07-02', NULL, 0),
(6, 44, 3, 6, 'appointment', 0, 0, 0, 0, 1, 1, '2024-07-02', NULL, 0),
(7, 44, 3, 7, 'notification', 0, 0, 0, 0, 1, 1, '2024-07-02', NULL, 0),
(8, 44, 3, 8, 'event', 0, 0, 0, 0, 1, 1, '2024-07-02', NULL, 0),
(9, 45, 3, 1, 'superadmin', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(10, 45, 3, 2, 'admin', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(11, 45, 3, 3, 'doctor', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(12, 45, 3, 4, 'staff', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(13, 45, 3, 5, 'patient', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(14, 45, 3, 6, 'appointment', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(15, 45, 3, 7, 'notification', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(16, 45, 3, 8, 'event', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(17, 46, 3, 1, 'superadmin', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(18, 46, 3, 2, 'admin', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(19, 46, 3, 3, 'doctor', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(20, 46, 3, 4, 'staff', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(21, 46, 3, 5, 'patient', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(22, 46, 3, 6, 'appointment', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(23, 46, 3, 7, 'notification', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(24, 46, 3, 8, 'event', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(25, 47, 3, 1, 'superadmin', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(26, 47, 3, 2, 'admin', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(27, 47, 3, 3, 'doctor', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(28, 47, 3, 4, 'staff', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(29, 47, 3, 5, 'patient', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(30, 47, 3, 6, 'appointment', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(31, 47, 3, 7, 'notification', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(32, 47, 3, 8, 'event', 0, 0, 0, 0, 1, 43, '2024-07-04', NULL, 0),
(33, 48, 3, 1, 'superadmin', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(34, 48, 3, 2, 'admin', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(35, 48, 3, 3, 'doctor', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(36, 48, 3, 4, 'staff', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(37, 48, 3, 5, 'patient', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(38, 48, 3, 6, 'appointment', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(39, 48, 3, 7, 'notification', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(40, 48, 3, 8, 'event', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(41, 49, 3, 1, 'superadmin', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(42, 49, 3, 2, 'admin', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(43, 49, 3, 3, 'doctor', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(44, 49, 3, 4, 'staff', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(45, 49, 3, 5, 'patient', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(46, 49, 3, 6, 'appointment', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(47, 49, 3, 7, 'notification', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(48, 49, 3, 8, 'event', 0, 0, 0, 0, 1, 43, '2024-07-05', NULL, 0),
(49, 50, 3, 1, 'superadmin', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(50, 50, 3, 2, 'admin', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(51, 50, 3, 3, 'doctor', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(52, 50, 3, 4, 'staff', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(53, 50, 3, 5, 'patient', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(54, 50, 3, 6, 'appointment', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(55, 50, 3, 7, 'notification', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(56, 50, 3, 8, 'event', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(57, 51, 3, 1, 'superadmin', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(58, 51, 3, 2, 'admin', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(59, 51, 3, 3, 'doctor', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(60, 51, 3, 4, 'staff', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(61, 51, 3, 5, 'patient', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(62, 51, 3, 6, 'appointment', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(63, 51, 3, 7, 'notification', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(64, 51, 3, 8, 'event', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(65, 52, 3, 1, 'superadmin', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(66, 52, 3, 2, 'admin', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(67, 52, 3, 3, 'doctor', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(68, 52, 3, 4, 'staff', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(69, 52, 3, 5, 'patient', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(70, 52, 3, 6, 'appointment', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(71, 52, 3, 7, 'notification', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(72, 52, 3, 8, 'event', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(73, 53, 3, 1, 'superadmin', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(74, 53, 3, 2, 'admin', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(75, 53, 3, 3, 'doctor', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(76, 53, 3, 4, 'staff', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(77, 53, 3, 5, 'patient', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(78, 53, 3, 6, 'appointment', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(79, 53, 3, 7, 'notification', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0),
(80, 53, 3, 8, 'event', 0, 0, 0, 0, 1, 1, '2024-07-05', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `permission_modules`
--

CREATE TABLE `permission_modules` (
  `id` int(11) NOT NULL,
  `module_name` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permission_modules`
--

INSERT INTO `permission_modules` (`id`, `module_name`, `status`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 'superadmin', 1, '2024-06-17', NULL, 0),
(2, 'admin', 1, '2024-06-17', NULL, 0),
(3, 'doctor', 1, '2024-06-17', NULL, 0),
(4, 'staff', 1, '2024-06-17', NULL, 0),
(5, 'appointment', 1, '2024-06-17', NULL, 0),
(6, 'notification', 1, '2024-06-17', NULL, 0),
(7, 'patient', 1, '2024-06-17', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `mobile_number` varchar(14) NOT NULL,
  `country` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `fees` float(11,2) DEFAULT NULL,
  `availibility` time DEFAULT NULL,
  `available_from_time` time DEFAULT NULL,
  `available_to_time` time DEFAULT NULL,
  `specialist` varchar(255) DEFAULT NULL,
  `education` varchar(255) DEFAULT NULL,
  `experience` float(11,2) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role_id`, `parent_id`, `name`, `email`, `password`, `date_of_birth`, `mobile_number`, `country`, `state`, `city`, `fees`, `availibility`, `available_from_time`, `available_to_time`, `specialist`, `education`, `experience`, `status`, `created_by`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 1, 0, 'Super A', 'vasu.rupolia@hexalitics.com', '$2b$10$.UJkz3taMDN425R6l2Mw8.QbEhQDr.C19DP.bjgoA88zzeo0YNQX2', '2000-01-17', '7878787878', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', 0.00, 1, 0, '2024-05-14', NULL, 0),
(4, 2, 1, 'Admin1', 'admin1@gmail.com', '$2b$10$zfcnFkslhDgyNyhh82kou./2H0OGNhpdhAlFjGvW8iD/nnD26HO/6', '2000-01-17', '7777777777', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', 0.00, 1, 0, '2024-05-14', NULL, 0),
(5, 2, 1, 'Admin1Updated', 'admin1updated@gmail.com', '$2b$10$CpcimO9nx331GRAoxodmuOyz.glwRW.dRGPGSDtmnByx17il7LWkS', '2001-07-08', '7070707070', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', 0.00, 1, 0, '2024-05-14', NULL, 0),
(6, 3, 4, 'Doctor1', 'doctor1@gmail.com', '$2b$10$d5xFecTQLNLJNPp4tiU1F.VUu14h9uBYKW2BtInbijhBpYpVWVDZy', '2000-07-05', '7777777777', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', 0.00, 1, 0, '2024-05-14', NULL, 0),
(7, 3, 5, 'Doctor2', 'doctor2@gmail.com', '$2b$10$5dN6W38b7fkdbAcGPXrjFeHEDcf/fsocvcjzV422j0.nCTxIXbbve', '2000-07-05', '7777777777', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '', '', 0.00, 1, 0, '2024-05-14', NULL, 0),
(8, 4, 6, 'Staff1 updated', 'staff1updated@gmail.com', '$2b$10$e49CWkXXnsxaeIp8gs8BiO2wJtbjdtSfBo39eR1DTR0zjqnLz8aaG', '2000-07-05', '9191919191', 'India', 'MP', 'Sagar', NULL, NULL, NULL, NULL, '', '', 0.00, 0, 0, '2024-05-14', '2024-05-30', 0),
(10, 2, 1, 'admin3', 'admin1@gmail.com', '$2b$10$2MZsh2OmeYzOWIEOlFEBmO6g9GBtL6Ilac0BMmTLo9GZqRdqWV1.6', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(11, 3, 1, 'doctor4', 'doctor4@gmail.com', '$2b$10$Zgxercr7PJie5uhoZHf4reADI.YxuC54Md5ppaFflTk3EpYY79qde', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(12, 3, 4, 'doctor5', 'doctor5@gmail.com', '$2b$10$y2y5pwtaqRsyqCvPo9m8FOkk9oqMDZv9Ql4WlUg/oc0OfDUTuiDzu', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(13, 4, 6, 'staff2', 'staff2@gmail.com', '$2b$10$Z3h4/6jD1mUxwfz7yT7GhOGVRh4oTWgNY8FsDqhtrPZfDVCbhddMq', '2000-07-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 1, '2024-05-28', NULL, 0),
(14, 4, 4, 'staff3', 'staff3@gmail.com', '$2b$10$Z3h4/6jD1mUxwfz7yT7GhOGVRh4oTWgNY8FsDqhtrPZfDVCbhddMq', '2000-06-03', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-06-03', NULL, 0),
(15, 3, 1, 'doctor6', 'doctor6@gmail.com', '$2b$10$f07mi8nsnOhDoySbg.GLZuDvPJgX3dNxugZ3tlKg5aWRTECz4sfe.', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(16, 3, 1, 'doctor7', 'doctor7@gmail.com', '$2b$10$WIlcUIaKa.qNZdG4qYfRMOwWDGfqpHZurh18jrIomPmhBL5au6x5S', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(17, 3, 1, 'doctor8', 'doctor8@gmail.com', '$2b$10$IxAI3W9URU0/KwKmTMlMd.1PLKHxYwfGCObVvXSg0qk8Ekk.Liuse', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(18, 3, 1, 'doctor9', 'doctor9@gmail.com', '$2b$10$I5EE9gZbLb.Yz6l8GOtL7u5yFrhhpze6xZwp8Gf3//BJTGvTfiy6q', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(19, 3, 1, 'doctor10', 'doctor10@gmail.com', '$2b$10$sABxRl29IGz5GiTaGoyozOWajmyNOZAGaD.gH6YR4T1FHgplMAp4q', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(20, 3, 1, 'doctor11', 'doctor11@gmail.com', '$2b$10$QxwpKP77JiofdFxGcqqhH.nR91XZ0g15.pIHLZZdmlq7o/RzibZOK', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(21, 3, 1, 'doctor12', 'doctor12@gmail.com', '$2b$10$JFlalA0X.7AAcFFdIBPv/eA2Y6v.AesSDrDvjlMj1udbWC8aIrE6u', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(22, 3, 1, 'doctor13', 'doctor13@gmail.com', '$2b$10$0uZ/BY8ByV.VE4.NuGAe0uL6GEMP8lyV16SykxFYYU.csTp6sis0C', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(23, 3, 1, 'doctor14', 'doctor14@gmail.com', '$2b$10$wLdDTUfRHOtrHXLq3v5LGOpb4vzkDuHQcRzfCS0GdoeOYyZfOnR4i', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(24, 3, 1, 'doctor15', 'doctor15@gmail.com', '$2b$10$UQim.9sJm8jrTZ1Lm9rWOuiHVfX8pM9nDdvYe6pPlIAwL2zoTTdyC', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(25, 3, 1, 'doctor16', 'doctor16@gmail.com', '$2b$10$WYmLlzOoeeD3aiXL/uI87uYOP4dDq4MJwWmbDrkRb9u24nLiZsIrS', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(26, 2, 1, 'admin4', 'admin4@gmail.com', '$2b$10$N4vYNu/sBskQdlq/K8ZzF.fM1BQd8H8uGO96fs0KYIuX0o2htwXfe', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(27, 2, 1, 'admin5', 'admin5@gmail.com', '$2b$10$yfZCQpYn4CGGxs5yAtvMfeQtuCRnYb4CFZCVUz4gxfe/k9wucIyvC', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(28, 2, 1, 'admin6', 'admin6@gmail.com', '$2b$10$8V1Svi6ZxPZWhqCsHlk6wu.AEQ/34W52lb92zMcFmL1Bhn8ejxyU6', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(29, 2, 1, 'admin7', 'admin7@gmail.com', '$2b$10$4rekDO3gE9Z7SdbUYTC9b.RuKRi45gB/K6qfoMXO.ueE2gNcc1Rcy', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(30, 2, 1, 'admin8', 'admin8@gmail.com', '$2b$10$CH3NFwGeDvUCZYp43xWDeOk81CAkoixXNTxpZ2MJI3kLUMHS42iVG', '2000-01-25', '7878787812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-05-28', NULL, 0),
(31, 2, 1, 'ashish', 'ashish.vishwakarma@hexalitics.com', '$2b$10$K25afwpCN9zmMXMpl33vkOV547oUOiROMPBghx8OWuSoTIyp7iXTa', '2024-06-07', '1234567898', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-06-13', NULL, 0),
(32, 2, 1, 'ashish12', 'ashish12@hexalitics.com', '$2b$10$mdLofgvsU.Q4MtF22xxJ9.OIsDvAqXZhc9zTPZ9/i820q6XkLWP/C', '2024-06-07', '123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-06-13', NULL, 0),
(33, 2, 1, 'john', 'john@hexalitics.com', '$2b$10$4.BvgFj/rpeor0tfpihVQOm2AkuehyCWpWgWlRXGmUKU1DPgyooYG', '2024-06-07', '123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-06-13', NULL, 0),
(34, 3, 1, 'A_DR john', 'Ajohn@hexalitics.com', '$2b$10$AOXvk4kIhhKYb9lT2zk1Oug.aUcRntrY.uEKWIDNjXmg2riiDyFta', '2024-06-07', '123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-06-13', NULL, 0),
(35, 2, 1, 'hkdjfhgkdjfgh', 'test@hexalitics.com', '$2b$10$g8HscLiK4ap6QUnCEazDXetENczgl.oIILg6nZDBxicGhf6S/AQqS', '2015-06-10', '7878787878', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-06-13', NULL, 0),
(36, 2, 1, 'Admin41', 'vasu.rupolia+10@hexalitics.com', '$2b$10$ZlgUckbEvtE8uLr79Bi5GuClYvG4DVHo7IHd/5nqVQGvOZqwc1cIm', '2012-02-14', '7878787878', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-06-17', NULL, 0),
(37, 2, 1, 'asmin1', 'asmin111@hexalitics.com', '$2b$10$Ndo5Zu4EUaNIsoNTCpxbvOaPkJMmH.FNcds.bOgORfR/f0yiHAJmO', '2024-06-06', '7878787878', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-06-17', NULL, 0),
(38, 2, 1, 'Admin42', 'vasu.rupolia+11@hexalitics.com', '$2b$10$b5g5KkVjtm99vKNYPxz47.NEkNWYaBsVHkq3Ie4jdJfFrPih2kgce', '1995-06-06', '7878787878', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-06-17', NULL, 0),
(39, 3, 4, 'ashish', 'admin12341@gmail.com', '$2b$10$4sT8kOFbTwaRoFAqifQi7u2cXY.WtK5aBZ.bWGspwlSr4sgIk7IzC', '2024-06-08', '1234567898', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 4, '2024-06-17', NULL, 0),
(40, 3, 4, 'testt', 'test@gmail.com', '$2b$10$doXB8/F6KFlojN2tqgztE.hxvjrikKVjxCAY3XXgS0/ms5cqMX4R6', '2024-08-01', '7878787878', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 4, '2024-06-17', NULL, 0),
(41, 3, 4, 'testt1234', 'test11@gmail.com', '$2b$10$OhtTd22yFggAZtfOCZc2de0fs6OM1uZiNu3DMh7UoH3R9qmI./ZkG', '2024-08-01', '7878787878', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 4, '2024-06-17', NULL, 0),
(42, 2, 1, 'newone', 'new@hexalitics.com', '$2b$10$B4GQKW36TzZAUjJndjskOOLAwZHa.8PiOaS3RigbrvCg3SvP3wCb2', '2024-06-14', '1234567898', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-06-17', NULL, 0),
(43, 1, 0, 'Vasu Rupolia', 'rupoliavasu2@gmail.com', '$2a$12$jgztZCWAXMBOyU5TkjhDu.9vS/ZL0c.oDS.tMBvhDOvp3HEe.3WeW', '1989-01-18', '8103622815', 'India', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-07-01', NULL, 0),
(44, 3, 1, 'doctortest1', 'doctortest1@gmail.com', '$2b$10$jGNdkumWafpXaJU8iWfByOVCdLypeX/uXbfil6FwCLfooWuxFUMpC', '2024-06-07', '123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-06-13', NULL, 0),
(47, 3, 43, 'Doctor new1', 'doctornew1@gmail.com', '$2b$10$i7TwUKKTDtc78c.81vE2m.uJ.pNb.NzAromh.SZIAtqLCydIzDy1G', '2000-01-01', '7575757575', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 43, '2024-07-04', NULL, 0),
(48, 3, 43, 'Doctor new2', 'doctornew2@gmail.com', '$2b$10$EE29HjXrg1cIiQn0qoOnJuE7DZSiN2OoZp8cKcm.xO4ccu4m0wuOS', '2000-01-01', '7575757571', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 43, '2024-07-05', NULL, 0),
(49, 3, 43, 'Doctor new3', 'doctornew3@gmail.com', '$2b$10$CQ6ZNv0CVoIDurRdpSbzu.gTxVuSaoX.PtFcPH2NObNq8l0u2Z0SW', '2000-01-01', '7575757572', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 43, '2024-07-05', NULL, 0),
(50, 3, 1, 'Doctor new4', 'doctornew4@gmail.com', '$2b$10$9wMLHNUqi/Yy.V.VhDaXPu7XDuilnYAJCNNy4b5CT7n87An5xQg7i', '2000-01-01', '7575757573', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-07-05', NULL, 0),
(51, 3, 1, 'Doctor new5', 'doctornew5@gmail.com', '$2b$10$tlEs3.KDiBxA3dmtAMHyDudM5XBTza79wW6h7HJSaLPRN0ClU43Gq', '2000-01-01', '7575757574', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-07-05', NULL, 0),
(52, 3, 1, 'Doctor new6', 'doctornew6@gmail.com', '$2b$10$g8CdQ5w0bcOGyOldIJsJle7DCWUiJ/M55RIdAdLYS5/SAZUY2hrGK', '2000-01-01', '7575757576', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-07-05', NULL, 0),
(53, 3, 1, 'Doctor new7', 'doctornew7@gmail.com', '$2b$10$ZUG35PTmNTfG9s7TTyjykusDX5dhs1cX3Ow7Jdg0hhkrNuhNBzTv6', '2000-01-01', '7575757577', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '2024-07-05', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(255) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `role_name`, `status`, `created_by`, `created_date`, `updated_date`, `is_deleted`) VALUES
(1, 'Superadmin', 1, 0, '2024-05-14', NULL, 0),
(2, 'Admin', 1, 1, '2024-05-14', NULL, 0),
(3, 'Doctor', 1, 1, '2024-05-14', NULL, 0),
(4, 'Staff', 1, 1, '2024-05-14', NULL, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `clinic_info`
--
ALTER TABLE `clinic_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doctor_master_vaccine_template`
--
ALTER TABLE `doctor_master_vaccine_template`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doctor_master_vaccine_template_vaccines`
--
ALTER TABLE `doctor_master_vaccine_template_vaccines`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doctor_time_slots`
--
ALTER TABLE `doctor_time_slots`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doctor_unavailability_info`
--
ALTER TABLE `doctor_unavailability_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `master_vaccine_template`
--
ALTER TABLE `master_vaccine_template`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `master_vaccine_template_vaccines`
--
ALTER TABLE `master_vaccine_template_vaccines`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patients_parent`
--
ALTER TABLE `patients_parent`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patient_vaccination_info`
--
ALTER TABLE `patient_vaccination_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permission_modules`
--
ALTER TABLE `permission_modules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `clinic_info`
--
ALTER TABLE `clinic_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `doctor_master_vaccine_template`
--
ALTER TABLE `doctor_master_vaccine_template`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `doctor_master_vaccine_template_vaccines`
--
ALTER TABLE `doctor_master_vaccine_template_vaccines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `doctor_time_slots`
--
ALTER TABLE `doctor_time_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `doctor_unavailability_info`
--
ALTER TABLE `doctor_unavailability_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `master_vaccine_template`
--
ALTER TABLE `master_vaccine_template`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `master_vaccine_template_vaccines`
--
ALTER TABLE `master_vaccine_template_vaccines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `patients_parent`
--
ALTER TABLE `patients_parent`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patient_vaccination_info`
--
ALTER TABLE `patient_vaccination_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `permission_modules`
--
ALTER TABLE `permission_modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
