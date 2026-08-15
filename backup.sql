--
-- PostgreSQL database dump
--

\restrict 5LT3MZQLgoT25AjJHBvqeO3rckxc7bbk9pxhrZwtJnnfx2NZMh254BwOETUMOkf

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: claim_reason_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.claim_reason_enum AS ENUM (
    'missing_item',
    'wrong_item',
    'production_failure',
    'other'
);


ALTER TYPE public.claim_reason_enum OWNER TO postgres;

--
-- Name: order_claim_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_claim_type_enum AS ENUM (
    'refund',
    'replace'
);


ALTER TYPE public.order_claim_type_enum OWNER TO postgres;

--
-- Name: order_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status_enum AS ENUM (
    'pending',
    'completed',
    'draft',
    'archived',
    'canceled',
    'requires_action'
);


ALTER TYPE public.order_status_enum OWNER TO postgres;

--
-- Name: return_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.return_status_enum AS ENUM (
    'open',
    'requested',
    'received',
    'partially_received',
    'canceled'
);


ALTER TYPE public.return_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_holder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_holder (
    id text NOT NULL,
    provider_id text NOT NULL,
    external_id text NOT NULL,
    email text,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.account_holder OWNER TO postgres;

--
-- Name: api_key; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_key (
    id text NOT NULL,
    token text NOT NULL,
    salt text NOT NULL,
    redacted text NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    last_used_at timestamp with time zone,
    created_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_by text,
    revoked_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT api_key_type_check CHECK ((type = ANY (ARRAY['publishable'::text, 'secret'::text])))
);


ALTER TABLE public.api_key OWNER TO postgres;

--
-- Name: api_key_api_key_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_key_api_key_store_store (
    api_key_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.api_key_api_key_store_store OWNER TO postgres;

--
-- Name: application_method_buy_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_method_buy_rules (
    application_method_id text NOT NULL,
    promotion_rule_id text NOT NULL
);


ALTER TABLE public.application_method_buy_rules OWNER TO postgres;

--
-- Name: application_method_target_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_method_target_rules (
    application_method_id text NOT NULL,
    promotion_rule_id text NOT NULL
);


ALTER TABLE public.application_method_target_rules OWNER TO postgres;

--
-- Name: auth_identity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_identity (
    id text NOT NULL,
    app_metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.auth_identity OWNER TO postgres;

--
-- Name: auth_mfa_factor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_mfa_factor (
    id text NOT NULL,
    auth_identity_id text NOT NULL,
    provider text NOT NULL,
    status text NOT NULL,
    provider_metadata jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.auth_mfa_factor OWNER TO postgres;

--
-- Name: auth_mfa_recovery_code; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_mfa_recovery_code (
    id text NOT NULL,
    auth_identity_id text NOT NULL,
    code_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.auth_mfa_recovery_code OWNER TO postgres;

--
-- Name: auth_password_reset_token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_password_reset_token (
    id text NOT NULL,
    auth_identity_id text NOT NULL,
    provider_identity_id text NOT NULL,
    entity_id text NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.auth_password_reset_token OWNER TO postgres;

--
-- Name: auth_verification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_verification (
    id text NOT NULL,
    auth_identity_id text NOT NULL,
    entity_id text NOT NULL,
    entity_type text NOT NULL,
    code_provider text NOT NULL,
    verified_at timestamp with time zone,
    requested_at timestamp with time zone NOT NULL,
    provider_metadata jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.auth_verification OWNER TO postgres;

--
-- Name: cancellation_case; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancellation_case (
    id text NOT NULL,
    subscription_id text NOT NULL,
    status text DEFAULT 'requested'::text NOT NULL,
    reason text,
    reason_category text,
    notes text,
    final_outcome text,
    finalized_at timestamp with time zone,
    finalized_by text,
    cancellation_effective_at timestamp with time zone,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT cancellation_case_final_outcome_check CHECK ((final_outcome = ANY (ARRAY['retained'::text, 'paused'::text, 'canceled'::text]))),
    CONSTRAINT cancellation_case_reason_category_check CHECK ((reason_category = ANY (ARRAY['price'::text, 'product_fit'::text, 'delivery'::text, 'billing'::text, 'temporary_pause'::text, 'switched_competitor'::text, 'other'::text]))),
    CONSTRAINT cancellation_case_status_check CHECK ((status = ANY (ARRAY['requested'::text, 'evaluating_retention'::text, 'retention_offered'::text, 'retained'::text, 'paused'::text, 'canceled'::text])))
);


ALTER TABLE public.cancellation_case OWNER TO postgres;

--
-- Name: capture; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.capture (
    id text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    payment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text,
    metadata jsonb
);


ALTER TABLE public.capture OWNER TO postgres;

--
-- Name: cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart (
    id text NOT NULL,
    region_id text,
    customer_id text,
    sales_channel_id text,
    email text,
    currency_code text NOT NULL,
    shipping_address_id text,
    billing_address_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    completed_at timestamp with time zone,
    locale text
);


ALTER TABLE public.cart OWNER TO postgres;

--
-- Name: cart_address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_address (
    id text NOT NULL,
    customer_id text,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.cart_address OWNER TO postgres;

--
-- Name: cart_line_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_line_item (
    id text NOT NULL,
    cart_id text NOT NULL,
    title text NOT NULL,
    subtitle text,
    thumbnail text,
    quantity integer NOT NULL,
    variant_id text,
    product_id text,
    product_title text,
    product_description text,
    product_subtitle text,
    product_type text,
    product_collection text,
    product_handle text,
    variant_sku text,
    variant_barcode text,
    variant_title text,
    variant_option_values jsonb,
    requires_shipping boolean DEFAULT true NOT NULL,
    is_discountable boolean DEFAULT true NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    compare_at_unit_price numeric,
    raw_compare_at_unit_price jsonb,
    unit_price numeric NOT NULL,
    raw_unit_price jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    product_type_id text,
    is_custom_price boolean DEFAULT false NOT NULL,
    is_giftcard boolean DEFAULT false NOT NULL,
    CONSTRAINT cart_line_item_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.cart_line_item OWNER TO postgres;

--
-- Name: cart_line_item_adjustment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_line_item_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    item_id text,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    CONSTRAINT cart_line_item_adjustment_check CHECK ((amount >= (0)::numeric))
);


ALTER TABLE public.cart_line_item_adjustment OWNER TO postgres;

--
-- Name: cart_line_item_tax_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_line_item_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate real NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    item_id text
);


ALTER TABLE public.cart_line_item_tax_line OWNER TO postgres;

--
-- Name: cart_payment_collection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_payment_collection (
    cart_id character varying(255) NOT NULL,
    payment_collection_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.cart_payment_collection OWNER TO postgres;

--
-- Name: cart_promotion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_promotion (
    cart_id character varying(255) NOT NULL,
    promotion_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.cart_promotion OWNER TO postgres;

--
-- Name: cart_shipping_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_shipping_method (
    id text NOT NULL,
    cart_id text NOT NULL,
    name text NOT NULL,
    description jsonb,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    shipping_option_id text,
    data jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT cart_shipping_method_check CHECK ((amount >= (0)::numeric))
);


ALTER TABLE public.cart_shipping_method OWNER TO postgres;

--
-- Name: cart_shipping_method_adjustment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_shipping_method_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    shipping_method_id text
);


ALTER TABLE public.cart_shipping_method_adjustment OWNER TO postgres;

--
-- Name: cart_shipping_method_tax_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_shipping_method_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate real NOT NULL,
    provider_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    shipping_method_id text
);


ALTER TABLE public.cart_shipping_method_tax_line OWNER TO postgres;

--
-- Name: credit_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credit_line (
    id text NOT NULL,
    cart_id text NOT NULL,
    reference text,
    reference_id text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.credit_line OWNER TO postgres;

--
-- Name: currency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.currency (
    code text NOT NULL,
    symbol text NOT NULL,
    symbol_native text NOT NULL,
    decimal_digits integer DEFAULT 0 NOT NULL,
    rounding numeric DEFAULT 0 NOT NULL,
    raw_rounding jsonb NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.currency OWNER TO postgres;

--
-- Name: customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer (
    id text NOT NULL,
    company_name text,
    first_name text,
    last_name text,
    email text,
    phone text,
    has_account boolean DEFAULT false NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text
);


ALTER TABLE public.customer OWNER TO postgres;

--
-- Name: customer_account_holder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_account_holder (
    customer_id character varying(255) NOT NULL,
    account_holder_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_account_holder OWNER TO postgres;

--
-- Name: customer_address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_address (
    id text NOT NULL,
    customer_id text NOT NULL,
    address_name text,
    is_default_shipping boolean DEFAULT false NOT NULL,
    is_default_billing boolean DEFAULT false NOT NULL,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_address OWNER TO postgres;

--
-- Name: customer_customer_sales_channel_sales_channel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_customer_sales_channel_sales_channel (
    customer_id character varying(255) NOT NULL,
    sales_channel_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_customer_sales_channel_sales_channel OWNER TO postgres;

--
-- Name: customer_customer_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_customer_store_store (
    customer_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_customer_store_store OWNER TO postgres;

--
-- Name: customer_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_group (
    id text NOT NULL,
    name text NOT NULL,
    metadata jsonb,
    created_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_group OWNER TO postgres;

--
-- Name: customer_group_customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_group_customer (
    id text NOT NULL,
    customer_id text NOT NULL,
    customer_group_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.customer_group_customer OWNER TO postgres;

--
-- Name: dunning_attempt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dunning_attempt (
    id text NOT NULL,
    dunning_case_id text NOT NULL,
    attempt_no integer NOT NULL,
    started_at timestamp with time zone NOT NULL,
    finished_at timestamp with time zone,
    status text DEFAULT 'processing'::text NOT NULL,
    error_code text,
    error_message text,
    payment_reference text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT dunning_attempt_status_check CHECK ((status = ANY (ARRAY['processing'::text, 'succeeded'::text, 'failed'::text])))
);


ALTER TABLE public.dunning_attempt OWNER TO postgres;

--
-- Name: dunning_case; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dunning_case (
    id text NOT NULL,
    subscription_id text NOT NULL,
    renewal_cycle_id text NOT NULL,
    renewal_order_id text,
    status text DEFAULT 'open'::text NOT NULL,
    attempt_count integer DEFAULT 0 NOT NULL,
    max_attempts integer NOT NULL,
    retry_schedule jsonb,
    next_retry_at timestamp with time zone,
    last_payment_error_code text,
    last_payment_error_message text,
    last_attempt_at timestamp with time zone,
    recovered_at timestamp with time zone,
    closed_at timestamp with time zone,
    recovery_reason text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT dunning_case_status_check CHECK ((status = ANY (ARRAY['open'::text, 'retry_scheduled'::text, 'retrying'::text, 'awaiting_manual_resolution'::text, 'recovered'::text, 'unrecovered'::text])))
);


ALTER TABLE public.dunning_case OWNER TO postgres;

--
-- Name: fulfillment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment (
    id text NOT NULL,
    location_id text NOT NULL,
    packed_at timestamp with time zone,
    shipped_at timestamp with time zone,
    delivered_at timestamp with time zone,
    canceled_at timestamp with time zone,
    data jsonb,
    provider_id text,
    shipping_option_id text,
    metadata jsonb,
    delivery_address_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    marked_shipped_by text,
    created_by text,
    requires_shipping boolean DEFAULT true NOT NULL
);


ALTER TABLE public.fulfillment OWNER TO postgres;

--
-- Name: fulfillment_address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_address (
    id text NOT NULL,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_address OWNER TO postgres;

--
-- Name: fulfillment_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_item (
    id text NOT NULL,
    title text NOT NULL,
    sku text NOT NULL,
    barcode text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    line_item_id text,
    inventory_item_id text,
    fulfillment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_item OWNER TO postgres;

--
-- Name: fulfillment_label; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_label (
    id text NOT NULL,
    tracking_number text NOT NULL,
    tracking_url text NOT NULL,
    label_url text NOT NULL,
    fulfillment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_label OWNER TO postgres;

--
-- Name: fulfillment_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_provider (
    id text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_provider OWNER TO postgres;

--
-- Name: fulfillment_set; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_set (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_set OWNER TO postgres;

--
-- Name: fulfillment_shipping_profile_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fulfillment_shipping_profile_store_store (
    shipping_profile_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.fulfillment_shipping_profile_store_store OWNER TO postgres;

--
-- Name: geo_zone; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.geo_zone (
    id text NOT NULL,
    type text DEFAULT 'country'::text NOT NULL,
    country_code text NOT NULL,
    province_code text,
    city text,
    service_zone_id text NOT NULL,
    postal_expression jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT geo_zone_type_check CHECK ((type = ANY (ARRAY['country'::text, 'province'::text, 'city'::text, 'zip'::text])))
);


ALTER TABLE public.geo_zone OWNER TO postgres;

--
-- Name: image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.image (
    id text NOT NULL,
    url text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    rank integer DEFAULT 0 NOT NULL,
    product_id text NOT NULL
);


ALTER TABLE public.image OWNER TO postgres;

--
-- Name: inventory_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_item (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    sku text,
    origin_country text,
    hs_code text,
    mid_code text,
    material text,
    weight integer,
    length integer,
    height integer,
    width integer,
    requires_shipping boolean DEFAULT true NOT NULL,
    description text,
    title text,
    thumbnail text,
    metadata jsonb
);


ALTER TABLE public.inventory_item OWNER TO postgres;

--
-- Name: inventory_level; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_level (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    inventory_item_id text NOT NULL,
    location_id text NOT NULL,
    stocked_quantity numeric DEFAULT 0 NOT NULL,
    reserved_quantity numeric DEFAULT 0 NOT NULL,
    incoming_quantity numeric DEFAULT 0 NOT NULL,
    metadata jsonb,
    raw_stocked_quantity jsonb,
    raw_reserved_quantity jsonb,
    raw_incoming_quantity jsonb
);


ALTER TABLE public.inventory_level OWNER TO postgres;

--
-- Name: invite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invite (
    id text NOT NULL,
    email text NOT NULL,
    accepted boolean DEFAULT false NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.invite OWNER TO postgres;

--
-- Name: invite_rbac_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invite_rbac_role (
    invite_id character varying(255) NOT NULL,
    rbac_role_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.invite_rbac_role OWNER TO postgres;

--
-- Name: link_module_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.link_module_migrations (
    id integer NOT NULL,
    table_name character varying(255) NOT NULL,
    link_descriptor jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.link_module_migrations OWNER TO postgres;

--
-- Name: link_module_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.link_module_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.link_module_migrations_id_seq OWNER TO postgres;

--
-- Name: link_module_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.link_module_migrations_id_seq OWNED BY public.link_module_migrations.id;


--
-- Name: location_fulfillment_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_fulfillment_provider (
    stock_location_id character varying(255) NOT NULL,
    fulfillment_provider_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.location_fulfillment_provider OWNER TO postgres;

--
-- Name: location_fulfillment_set; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_fulfillment_set (
    stock_location_id character varying(255) NOT NULL,
    fulfillment_set_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.location_fulfillment_set OWNER TO postgres;

--
-- Name: mikro_orm_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mikro_orm_migrations (
    id integer NOT NULL,
    name character varying(255),
    executed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.mikro_orm_migrations OWNER TO postgres;

--
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mikro_orm_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mikro_orm_migrations_id_seq OWNER TO postgres;

--
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mikro_orm_migrations_id_seq OWNED BY public.mikro_orm_migrations.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id text NOT NULL,
    "to" text NOT NULL,
    channel text NOT NULL,
    template text,
    data jsonb,
    trigger_type text,
    resource_id text,
    resource_type text,
    receiver_id text,
    original_notification_id text,
    idempotency_key text,
    external_id text,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    "from" text,
    provider_data jsonb,
    CONSTRAINT notification_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'success'::text, 'failure'::text])))
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- Name: notification_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_provider (
    id text NOT NULL,
    handle text NOT NULL,
    name text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    channels text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.notification_provider OWNER TO postgres;

--
-- Name: order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."order" (
    id text NOT NULL,
    region_id text,
    display_id integer,
    customer_id text,
    version integer DEFAULT 1 NOT NULL,
    sales_channel_id text,
    status public.order_status_enum DEFAULT 'pending'::public.order_status_enum NOT NULL,
    is_draft_order boolean DEFAULT false NOT NULL,
    email text,
    currency_code text NOT NULL,
    shipping_address_id text,
    billing_address_id text,
    no_notification boolean,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    canceled_at timestamp with time zone,
    custom_display_id text,
    locale text
);


ALTER TABLE public."order" OWNER TO postgres;

--
-- Name: order_address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_address (
    id text NOT NULL,
    customer_id text,
    company text,
    first_name text,
    last_name text,
    address_1 text,
    address_2 text,
    city text,
    country_code text,
    province text,
    postal_code text,
    phone text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_address OWNER TO postgres;

--
-- Name: order_cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_cart (
    order_id character varying(255) NOT NULL,
    cart_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_cart OWNER TO postgres;

--
-- Name: order_change; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_change (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    internal_note text,
    created_by text,
    requested_by text,
    requested_at timestamp with time zone,
    confirmed_by text,
    confirmed_at timestamp with time zone,
    declined_by text,
    declined_reason text,
    metadata jsonb,
    declined_at timestamp with time zone,
    canceled_by text,
    canceled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    change_type text,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text,
    carry_over_promotions boolean,
    CONSTRAINT order_change_status_check CHECK ((status = ANY (ARRAY['confirmed'::text, 'declined'::text, 'requested'::text, 'pending'::text, 'canceled'::text])))
);


ALTER TABLE public.order_change OWNER TO postgres;

--
-- Name: order_change_action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_change_action (
    id text NOT NULL,
    order_id text,
    version integer,
    ordering bigint NOT NULL,
    order_change_id text,
    reference text,
    reference_id text,
    action text NOT NULL,
    details jsonb,
    amount numeric,
    raw_amount jsonb,
    internal_note text,
    applied boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text
);


ALTER TABLE public.order_change_action OWNER TO postgres;

--
-- Name: order_change_action_ordering_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_change_action_ordering_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_change_action_ordering_seq OWNER TO postgres;

--
-- Name: order_change_action_ordering_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_change_action_ordering_seq OWNED BY public.order_change_action.ordering;


--
-- Name: order_claim; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_claim (
    id text NOT NULL,
    order_id text NOT NULL,
    return_id text,
    order_version integer NOT NULL,
    display_id integer NOT NULL,
    type public.order_claim_type_enum NOT NULL,
    no_notification boolean,
    refund_amount numeric,
    raw_refund_amount jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    canceled_at timestamp with time zone,
    created_by text
);


ALTER TABLE public.order_claim OWNER TO postgres;

--
-- Name: order_claim_display_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_claim_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_claim_display_id_seq OWNER TO postgres;

--
-- Name: order_claim_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_claim_display_id_seq OWNED BY public.order_claim.display_id;


--
-- Name: order_claim_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_claim_item (
    id text NOT NULL,
    claim_id text NOT NULL,
    item_id text NOT NULL,
    is_additional_item boolean DEFAULT false NOT NULL,
    reason public.claim_reason_enum,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    note text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_claim_item OWNER TO postgres;

--
-- Name: order_claim_item_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_claim_item_image (
    id text NOT NULL,
    claim_item_id text NOT NULL,
    url text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_claim_item_image OWNER TO postgres;

--
-- Name: order_credit_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_credit_line (
    id text NOT NULL,
    order_id text NOT NULL,
    reference text,
    reference_id text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.order_credit_line OWNER TO postgres;

--
-- Name: order_display_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_display_id_seq OWNER TO postgres;

--
-- Name: order_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_display_id_seq OWNED BY public."order".display_id;


--
-- Name: order_exchange; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_exchange (
    id text NOT NULL,
    order_id text NOT NULL,
    return_id text,
    order_version integer NOT NULL,
    display_id integer NOT NULL,
    no_notification boolean,
    allow_backorder boolean DEFAULT false NOT NULL,
    difference_due numeric,
    raw_difference_due jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    canceled_at timestamp with time zone,
    created_by text
);


ALTER TABLE public.order_exchange OWNER TO postgres;

--
-- Name: order_exchange_display_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_exchange_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_exchange_display_id_seq OWNER TO postgres;

--
-- Name: order_exchange_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_exchange_display_id_seq OWNED BY public.order_exchange.display_id;


--
-- Name: order_exchange_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_exchange_item (
    id text NOT NULL,
    exchange_id text NOT NULL,
    item_id text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    note text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_exchange_item OWNER TO postgres;

--
-- Name: order_fulfillment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_fulfillment (
    order_id character varying(255) NOT NULL,
    fulfillment_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_fulfillment OWNER TO postgres;

--
-- Name: order_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_item (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer NOT NULL,
    item_id text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    fulfilled_quantity numeric NOT NULL,
    raw_fulfilled_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    shipped_quantity numeric NOT NULL,
    raw_shipped_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    return_requested_quantity numeric NOT NULL,
    raw_return_requested_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    return_received_quantity numeric NOT NULL,
    raw_return_received_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    return_dismissed_quantity numeric NOT NULL,
    raw_return_dismissed_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    written_off_quantity numeric NOT NULL,
    raw_written_off_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    delivered_quantity numeric DEFAULT 0 NOT NULL,
    raw_delivered_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    unit_price numeric,
    raw_unit_price jsonb,
    compare_at_unit_price numeric,
    raw_compare_at_unit_price jsonb
);


ALTER TABLE public.order_item OWNER TO postgres;

--
-- Name: order_line_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_line_item (
    id text NOT NULL,
    totals_id text,
    title text NOT NULL,
    subtitle text,
    thumbnail text,
    variant_id text,
    product_id text,
    product_title text,
    product_description text,
    product_subtitle text,
    product_type text,
    product_collection text,
    product_handle text,
    variant_sku text,
    variant_barcode text,
    variant_title text,
    variant_option_values jsonb,
    requires_shipping boolean DEFAULT true NOT NULL,
    is_discountable boolean DEFAULT true NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    compare_at_unit_price numeric,
    raw_compare_at_unit_price jsonb,
    unit_price numeric NOT NULL,
    raw_unit_price jsonb NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    is_custom_price boolean DEFAULT false NOT NULL,
    product_type_id text,
    is_giftcard boolean DEFAULT false NOT NULL
);


ALTER TABLE public.order_line_item OWNER TO postgres;

--
-- Name: order_line_item_adjustment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_line_item_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    item_id text NOT NULL,
    deleted_at timestamp with time zone,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    version integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.order_line_item_adjustment OWNER TO postgres;

--
-- Name: order_line_item_tax_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_line_item_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate numeric NOT NULL,
    raw_rate jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    item_id text NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_line_item_tax_line OWNER TO postgres;

--
-- Name: order_order_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_order_store_store (
    order_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_order_store_store OWNER TO postgres;

--
-- Name: order_payment_collection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_payment_collection (
    order_id character varying(255) NOT NULL,
    payment_collection_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_payment_collection OWNER TO postgres;

--
-- Name: order_promotion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_promotion (
    order_id character varying(255) NOT NULL,
    promotion_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_promotion OWNER TO postgres;

--
-- Name: order_shipping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_shipping (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer NOT NULL,
    shipping_method_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text
);


ALTER TABLE public.order_shipping OWNER TO postgres;

--
-- Name: order_shipping_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_shipping_method (
    id text NOT NULL,
    name text NOT NULL,
    description jsonb,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    shipping_option_id text,
    data jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    is_custom_amount boolean DEFAULT false NOT NULL
);


ALTER TABLE public.order_shipping_method OWNER TO postgres;

--
-- Name: order_shipping_method_adjustment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_shipping_method_adjustment (
    id text NOT NULL,
    description text,
    promotion_id text,
    code text,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    shipping_method_id text NOT NULL,
    deleted_at timestamp with time zone,
    version integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.order_shipping_method_adjustment OWNER TO postgres;

--
-- Name: order_shipping_method_tax_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_shipping_method_tax_line (
    id text NOT NULL,
    description text,
    tax_rate_id text,
    code text NOT NULL,
    rate numeric NOT NULL,
    raw_rate jsonb NOT NULL,
    provider_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    shipping_method_id text NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_shipping_method_tax_line OWNER TO postgres;

--
-- Name: order_summary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_summary (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    totals jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.order_summary OWNER TO postgres;

--
-- Name: order_transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_transaction (
    id text NOT NULL,
    order_id text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    currency_code text NOT NULL,
    reference text,
    reference_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    return_id text,
    claim_id text,
    exchange_id text
);


ALTER TABLE public.order_transaction OWNER TO postgres;

--
-- Name: payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment (
    id text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    currency_code text NOT NULL,
    provider_id text NOT NULL,
    data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    captured_at timestamp with time zone,
    canceled_at timestamp with time zone,
    payment_collection_id text NOT NULL,
    payment_session_id text NOT NULL,
    metadata jsonb
);


ALTER TABLE public.payment OWNER TO postgres;

--
-- Name: payment_collection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_collection (
    id text NOT NULL,
    currency_code text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    authorized_amount numeric,
    raw_authorized_amount jsonb,
    captured_amount numeric,
    raw_captured_amount jsonb,
    refunded_amount numeric,
    raw_refunded_amount jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    completed_at timestamp with time zone,
    status text DEFAULT 'not_paid'::text NOT NULL,
    metadata jsonb,
    CONSTRAINT payment_collection_status_check CHECK ((status = ANY (ARRAY['not_paid'::text, 'awaiting'::text, 'authorized'::text, 'partially_authorized'::text, 'canceled'::text, 'failed'::text, 'partially_captured'::text, 'completed'::text])))
);


ALTER TABLE public.payment_collection OWNER TO postgres;

--
-- Name: payment_collection_payment_providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_collection_payment_providers (
    payment_collection_id text NOT NULL,
    payment_provider_id text NOT NULL
);


ALTER TABLE public.payment_collection_payment_providers OWNER TO postgres;

--
-- Name: payment_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_provider (
    id text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.payment_provider OWNER TO postgres;

--
-- Name: payment_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_session (
    id text NOT NULL,
    currency_code text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    provider_id text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    context jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    authorized_at timestamp with time zone,
    payment_collection_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT payment_session_status_check CHECK ((status = ANY (ARRAY['authorized'::text, 'captured'::text, 'pending'::text, 'requires_more'::text, 'error'::text, 'canceled'::text])))
);


ALTER TABLE public.payment_session OWNER TO postgres;

--
-- Name: plan_offer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plan_offer (
    id text NOT NULL,
    name text NOT NULL,
    scope text NOT NULL,
    product_id text NOT NULL,
    variant_id text,
    is_enabled boolean DEFAULT true NOT NULL,
    allowed_frequencies jsonb NOT NULL,
    frequency_intervals text[] DEFAULT '{}'::text[] NOT NULL,
    discount_per_frequency jsonb,
    rules jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT plan_offer_scope_check CHECK ((scope = ANY (ARRAY['product'::text, 'variant'::text])))
);


ALTER TABLE public.plan_offer OWNER TO postgres;

--
-- Name: price; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price (
    id text NOT NULL,
    title text,
    price_set_id text NOT NULL,
    currency_code text NOT NULL,
    raw_amount jsonb NOT NULL,
    rules_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    price_list_id text,
    amount numeric NOT NULL,
    min_quantity numeric,
    max_quantity numeric,
    raw_min_quantity jsonb,
    raw_max_quantity jsonb
);


ALTER TABLE public.price OWNER TO postgres;

--
-- Name: price_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_list (
    id text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    rules_count integer DEFAULT 0,
    title text NOT NULL,
    description text NOT NULL,
    type text DEFAULT 'sale'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    metadata jsonb,
    CONSTRAINT price_list_status_check CHECK ((status = ANY (ARRAY['active'::text, 'draft'::text]))),
    CONSTRAINT price_list_type_check CHECK ((type = ANY (ARRAY['sale'::text, 'override'::text])))
);


ALTER TABLE public.price_list OWNER TO postgres;

--
-- Name: price_list_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_list_rule (
    id text NOT NULL,
    price_list_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    value jsonb,
    attribute text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.price_list_rule OWNER TO postgres;

--
-- Name: price_preference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_preference (
    id text NOT NULL,
    attribute text NOT NULL,
    value text,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.price_preference OWNER TO postgres;

--
-- Name: price_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_rule (
    id text NOT NULL,
    value text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    price_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    attribute text DEFAULT ''::text NOT NULL,
    operator text DEFAULT 'eq'::text NOT NULL,
    CONSTRAINT price_rule_operator_check CHECK ((operator = ANY (ARRAY['gte'::text, 'lte'::text, 'gt'::text, 'lt'::text, 'eq'::text])))
);


ALTER TABLE public.price_rule OWNER TO postgres;

--
-- Name: price_set; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_set (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.price_set OWNER TO postgres;

--
-- Name: pricing_price_list_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pricing_price_list_store_store (
    price_list_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.pricing_price_list_store_store OWNER TO postgres;

--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    id text NOT NULL,
    title text NOT NULL,
    handle text NOT NULL,
    subtitle text,
    description text,
    is_giftcard boolean DEFAULT false NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    thumbnail text,
    weight real,
    length real,
    height real,
    width real,
    origin_country text,
    hs_code text,
    mid_code text,
    material text,
    collection_id text,
    type_id text,
    discountable boolean DEFAULT true NOT NULL,
    external_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    metadata jsonb,
    CONSTRAINT product_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'proposed'::text, 'published'::text, 'rejected'::text])))
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: product_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_category (
    id text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    handle text NOT NULL,
    mpath text NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    is_internal boolean DEFAULT false NOT NULL,
    rank integer DEFAULT 0 NOT NULL,
    parent_category_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    metadata jsonb,
    external_id text
);


ALTER TABLE public.product_category OWNER TO postgres;

--
-- Name: product_category_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_category_image (
    id text NOT NULL,
    url text NOT NULL,
    file_id text NOT NULL,
    type text NOT NULL,
    category_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT product_category_image_type_check CHECK ((type = ANY (ARRAY['thumbnail'::text, 'image'::text])))
);


ALTER TABLE public.product_category_image OWNER TO postgres;

--
-- Name: product_category_product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_category_product (
    product_id text NOT NULL,
    product_category_id text NOT NULL
);


ALTER TABLE public.product_category_product OWNER TO postgres;

--
-- Name: product_collection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_collection (
    id text NOT NULL,
    title text NOT NULL,
    handle text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    external_id text
);


ALTER TABLE public.product_collection OWNER TO postgres;

--
-- Name: product_option; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_option (
    id text NOT NULL,
    title text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    is_exclusive boolean DEFAULT false NOT NULL
);


ALTER TABLE public.product_option OWNER TO postgres;

--
-- Name: product_option_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_option_value (
    id text NOT NULL,
    value text NOT NULL,
    option_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    rank integer
);


ALTER TABLE public.product_option_value OWNER TO postgres;

--
-- Name: product_product_category_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_product_category_store_store (
    product_category_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_product_category_store_store OWNER TO postgres;

--
-- Name: product_product_collection_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_product_collection_store_store (
    product_collection_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_product_collection_store_store OWNER TO postgres;

--
-- Name: product_product_option; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_product_option (
    id text NOT NULL,
    product_id text NOT NULL,
    product_option_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_product_option OWNER TO postgres;

--
-- Name: product_product_option_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_product_option_store_store (
    product_option_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_product_option_store_store OWNER TO postgres;

--
-- Name: product_product_option_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_product_option_value (
    id text NOT NULL,
    product_product_option_id text NOT NULL,
    product_option_value_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_product_option_value OWNER TO postgres;

--
-- Name: product_product_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_product_store_store (
    product_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_product_store_store OWNER TO postgres;

--
-- Name: product_sales_channel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_sales_channel (
    product_id character varying(255) NOT NULL,
    sales_channel_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_sales_channel OWNER TO postgres;

--
-- Name: product_shipping_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_shipping_profile (
    product_id character varying(255) NOT NULL,
    shipping_profile_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_shipping_profile OWNER TO postgres;

--
-- Name: product_tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_tag (
    id text NOT NULL,
    value text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    external_id text
);


ALTER TABLE public.product_tag OWNER TO postgres;

--
-- Name: product_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_tags (
    product_id text NOT NULL,
    product_tag_id text NOT NULL
);


ALTER TABLE public.product_tags OWNER TO postgres;

--
-- Name: product_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_type (
    id text NOT NULL,
    value text NOT NULL,
    metadata json,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    external_id text
);


ALTER TABLE public.product_type OWNER TO postgres;

--
-- Name: product_variant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variant (
    id text NOT NULL,
    title text NOT NULL,
    sku text,
    barcode text,
    ean text,
    upc text,
    allow_backorder boolean DEFAULT false NOT NULL,
    manage_inventory boolean DEFAULT true NOT NULL,
    hs_code text,
    origin_country text,
    mid_code text,
    material text,
    weight real,
    length real,
    height real,
    width real,
    metadata jsonb,
    variant_rank integer DEFAULT 0,
    product_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    thumbnail text
);


ALTER TABLE public.product_variant OWNER TO postgres;

--
-- Name: product_variant_inventory_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variant_inventory_item (
    variant_id character varying(255) NOT NULL,
    inventory_item_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    required_quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_variant_inventory_item OWNER TO postgres;

--
-- Name: product_variant_option; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variant_option (
    variant_id text NOT NULL,
    option_value_id text NOT NULL
);


ALTER TABLE public.product_variant_option OWNER TO postgres;

--
-- Name: product_variant_price_set; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variant_price_set (
    variant_id character varying(255) NOT NULL,
    price_set_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_variant_price_set OWNER TO postgres;

--
-- Name: product_variant_product_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variant_product_image (
    id text NOT NULL,
    variant_id text NOT NULL,
    image_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.product_variant_product_image OWNER TO postgres;

--
-- Name: promotion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion (
    id text NOT NULL,
    code text NOT NULL,
    campaign_id text,
    is_automatic boolean DEFAULT false NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    is_tax_inclusive boolean DEFAULT false NOT NULL,
    "limit" integer,
    used integer DEFAULT 0 NOT NULL,
    metadata jsonb,
    CONSTRAINT promotion_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'inactive'::text]))),
    CONSTRAINT promotion_type_check CHECK ((type = ANY (ARRAY['standard'::text, 'buyget'::text])))
);


ALTER TABLE public.promotion OWNER TO postgres;

--
-- Name: promotion_application_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_application_method (
    id text NOT NULL,
    value numeric,
    raw_value jsonb,
    max_quantity integer,
    apply_to_quantity integer,
    buy_rules_min_quantity integer,
    type text NOT NULL,
    target_type text NOT NULL,
    allocation text,
    promotion_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    currency_code text,
    CONSTRAINT promotion_application_method_allocation_check CHECK ((allocation = ANY (ARRAY['each'::text, 'across'::text, 'once'::text]))),
    CONSTRAINT promotion_application_method_target_type_check CHECK ((target_type = ANY (ARRAY['order'::text, 'shipping_methods'::text, 'items'::text]))),
    CONSTRAINT promotion_application_method_type_check CHECK ((type = ANY (ARRAY['fixed'::text, 'percentage'::text])))
);


ALTER TABLE public.promotion_application_method OWNER TO postgres;

--
-- Name: promotion_campaign; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_campaign (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    campaign_identifier text NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.promotion_campaign OWNER TO postgres;

--
-- Name: promotion_campaign_budget; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_campaign_budget (
    id text NOT NULL,
    type text NOT NULL,
    campaign_id text NOT NULL,
    "limit" numeric,
    raw_limit jsonb,
    used numeric DEFAULT 0 NOT NULL,
    raw_used jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    currency_code text,
    attribute text,
    CONSTRAINT promotion_campaign_budget_type_check CHECK ((type = ANY (ARRAY['spend'::text, 'usage'::text, 'use_by_attribute'::text, 'spend_by_attribute'::text])))
);


ALTER TABLE public.promotion_campaign_budget OWNER TO postgres;

--
-- Name: promotion_campaign_budget_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_campaign_budget_usage (
    id text NOT NULL,
    attribute_value text NOT NULL,
    used numeric DEFAULT 0 NOT NULL,
    budget_id text NOT NULL,
    raw_used jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.promotion_campaign_budget_usage OWNER TO postgres;

--
-- Name: promotion_campaign_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_campaign_store_store (
    campaign_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.promotion_campaign_store_store OWNER TO postgres;

--
-- Name: promotion_promotion_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_promotion_rule (
    promotion_id text NOT NULL,
    promotion_rule_id text NOT NULL
);


ALTER TABLE public.promotion_promotion_rule OWNER TO postgres;

--
-- Name: promotion_promotion_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_promotion_store_store (
    promotion_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.promotion_promotion_store_store OWNER TO postgres;

--
-- Name: promotion_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_rule (
    id text NOT NULL,
    description text,
    attribute text NOT NULL,
    operator text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT promotion_rule_operator_check CHECK ((operator = ANY (ARRAY['gte'::text, 'lte'::text, 'gt'::text, 'lt'::text, 'eq'::text, 'ne'::text, 'in'::text])))
);


ALTER TABLE public.promotion_rule OWNER TO postgres;

--
-- Name: promotion_rule_value; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_rule_value (
    id text NOT NULL,
    promotion_rule_id text NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.promotion_rule_value OWNER TO postgres;

--
-- Name: property_label; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.property_label (
    id text NOT NULL,
    entity text NOT NULL,
    property text NOT NULL,
    label text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.property_label OWNER TO postgres;

--
-- Name: provider_identity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provider_identity (
    id text NOT NULL,
    entity_id text NOT NULL,
    provider text NOT NULL,
    auth_identity_id text NOT NULL,
    user_metadata jsonb,
    provider_metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.provider_identity OWNER TO postgres;

--
-- Name: publishable_api_key_sales_channel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publishable_api_key_sales_channel (
    publishable_key_id character varying(255) NOT NULL,
    sales_channel_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.publishable_api_key_sales_channel OWNER TO postgres;

--
-- Name: refund; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refund (
    id text NOT NULL,
    amount numeric NOT NULL,
    raw_amount jsonb NOT NULL,
    payment_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    created_by text,
    metadata jsonb,
    refund_reason_id text,
    note text
);


ALTER TABLE public.refund OWNER TO postgres;

--
-- Name: refund_reason; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refund_reason (
    id text NOT NULL,
    label text NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    code text NOT NULL
);


ALTER TABLE public.refund_reason OWNER TO postgres;

--
-- Name: region; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.region (
    id text NOT NULL,
    name text NOT NULL,
    currency_code text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    automatic_taxes boolean DEFAULT true NOT NULL
);


ALTER TABLE public.region OWNER TO postgres;

--
-- Name: region_country; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.region_country (
    iso_2 text NOT NULL,
    iso_3 text NOT NULL,
    num_code text NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    region_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.region_country OWNER TO postgres;

--
-- Name: region_payment_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.region_payment_provider (
    region_id character varying(255) NOT NULL,
    payment_provider_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.region_payment_provider OWNER TO postgres;

--
-- Name: renewal_attempt; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.renewal_attempt (
    id text NOT NULL,
    renewal_cycle_id text NOT NULL,
    attempt_no integer NOT NULL,
    started_at timestamp with time zone NOT NULL,
    finished_at timestamp with time zone,
    status text DEFAULT 'processing'::text NOT NULL,
    error_code text,
    error_message text,
    payment_reference text,
    order_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT renewal_attempt_status_check CHECK ((status = ANY (ARRAY['processing'::text, 'succeeded'::text, 'failed'::text])))
);


ALTER TABLE public.renewal_attempt OWNER TO postgres;

--
-- Name: renewal_cycle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.renewal_cycle (
    id text NOT NULL,
    subscription_id text NOT NULL,
    scheduled_for timestamp with time zone NOT NULL,
    processed_at timestamp with time zone,
    status text DEFAULT 'scheduled'::text NOT NULL,
    approval_required boolean DEFAULT false NOT NULL,
    approval_status text,
    approval_decided_at timestamp with time zone,
    approval_decided_by text,
    approval_reason text,
    generated_order_id text,
    applied_pending_update_data jsonb,
    last_error text,
    attempt_count integer DEFAULT 0 NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT renewal_cycle_approval_status_check CHECK ((approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT renewal_cycle_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'processing'::text, 'succeeded'::text, 'failed'::text])))
);


ALTER TABLE public.renewal_cycle OWNER TO postgres;

--
-- Name: renewal_renewal_cycle_order_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.renewal_renewal_cycle_order_order (
    renewal_cycle_id character varying(255) NOT NULL,
    order_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.renewal_renewal_cycle_order_order OWNER TO postgres;

--
-- Name: reservation_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation_item (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    line_item_id text,
    location_id text NOT NULL,
    quantity numeric NOT NULL,
    external_id text,
    description text,
    created_by text,
    metadata jsonb,
    inventory_item_id text NOT NULL,
    allow_backorder boolean DEFAULT false,
    raw_quantity jsonb
);


ALTER TABLE public.reservation_item OWNER TO postgres;

--
-- Name: retention_offer_event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.retention_offer_event (
    id text NOT NULL,
    cancellation_case_id text NOT NULL,
    offer_type text NOT NULL,
    offer_payload jsonb,
    decision_status text DEFAULT 'proposed'::text NOT NULL,
    decision_reason text,
    decided_at timestamp with time zone,
    decided_by text,
    applied_at timestamp with time zone,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT retention_offer_event_decision_status_check CHECK ((decision_status = ANY (ARRAY['proposed'::text, 'accepted'::text, 'rejected'::text, 'applied'::text, 'expired'::text]))),
    CONSTRAINT retention_offer_event_offer_type_check CHECK ((offer_type = ANY (ARRAY['pause_offer'::text, 'discount_offer'::text, 'bonus_offer'::text])))
);


ALTER TABLE public.retention_offer_event OWNER TO postgres;

--
-- Name: return; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return (
    id text NOT NULL,
    order_id text NOT NULL,
    claim_id text,
    exchange_id text,
    order_version integer NOT NULL,
    display_id integer NOT NULL,
    status public.return_status_enum DEFAULT 'open'::public.return_status_enum NOT NULL,
    no_notification boolean,
    refund_amount numeric,
    raw_refund_amount jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    received_at timestamp with time zone,
    canceled_at timestamp with time zone,
    location_id text,
    requested_at timestamp with time zone,
    created_by text
);


ALTER TABLE public.return OWNER TO postgres;

--
-- Name: return_display_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.return_display_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.return_display_id_seq OWNER TO postgres;

--
-- Name: return_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.return_display_id_seq OWNED BY public.return.display_id;


--
-- Name: return_fulfillment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_fulfillment (
    return_id character varying(255) NOT NULL,
    fulfillment_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.return_fulfillment OWNER TO postgres;

--
-- Name: return_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_item (
    id text NOT NULL,
    return_id text NOT NULL,
    reason_id text,
    item_id text NOT NULL,
    quantity numeric NOT NULL,
    raw_quantity jsonb NOT NULL,
    received_quantity numeric DEFAULT 0 NOT NULL,
    raw_received_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL,
    note text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    damaged_quantity numeric DEFAULT 0 NOT NULL,
    raw_damaged_quantity jsonb DEFAULT '{"value": "0", "precision": 20}'::jsonb NOT NULL
);


ALTER TABLE public.return_item OWNER TO postgres;

--
-- Name: return_reason; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_reason (
    id character varying NOT NULL,
    value character varying NOT NULL,
    label character varying NOT NULL,
    description character varying,
    metadata jsonb,
    parent_return_reason_id character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.return_reason OWNER TO postgres;

--
-- Name: sales_channel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_channel (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    is_disabled boolean DEFAULT false NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.sales_channel OWNER TO postgres;

--
-- Name: sales_channel_stock_location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_channel_stock_location (
    sales_channel_id character varying(255) NOT NULL,
    stock_location_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.sales_channel_stock_location OWNER TO postgres;

--
-- Name: script_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.script_migrations (
    id integer NOT NULL,
    script_name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    finished_at timestamp with time zone
);


ALTER TABLE public.script_migrations OWNER TO postgres;

--
-- Name: script_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.script_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.script_migrations_id_seq OWNER TO postgres;

--
-- Name: script_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.script_migrations_id_seq OWNED BY public.script_migrations.id;


--
-- Name: service_zone; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_zone (
    id text NOT NULL,
    name text NOT NULL,
    metadata jsonb,
    fulfillment_set_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.service_zone OWNER TO postgres;

--
-- Name: shipping_option; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_option (
    id text NOT NULL,
    name text NOT NULL,
    price_type text DEFAULT 'flat'::text NOT NULL,
    service_zone_id text NOT NULL,
    shipping_profile_id text,
    provider_id text,
    data jsonb,
    metadata jsonb,
    shipping_option_type_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT shipping_option_price_type_check CHECK ((price_type = ANY (ARRAY['calculated'::text, 'flat'::text])))
);


ALTER TABLE public.shipping_option OWNER TO postgres;

--
-- Name: shipping_option_price_set; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_option_price_set (
    shipping_option_id character varying(255) NOT NULL,
    price_set_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.shipping_option_price_set OWNER TO postgres;

--
-- Name: shipping_option_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_option_rule (
    id text NOT NULL,
    attribute text NOT NULL,
    operator text NOT NULL,
    value jsonb,
    shipping_option_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT shipping_option_rule_operator_check CHECK ((operator = ANY (ARRAY['in'::text, 'eq'::text, 'ne'::text, 'gt'::text, 'gte'::text, 'lt'::text, 'lte'::text, 'nin'::text])))
);


ALTER TABLE public.shipping_option_rule OWNER TO postgres;

--
-- Name: shipping_option_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_option_type (
    id text NOT NULL,
    label text NOT NULL,
    description text,
    code text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.shipping_option_type OWNER TO postgres;

--
-- Name: shipping_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_profile (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.shipping_profile OWNER TO postgres;

--
-- Name: stock_location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_location (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    name text NOT NULL,
    address_id text,
    metadata jsonb
);


ALTER TABLE public.stock_location OWNER TO postgres;

--
-- Name: stock_location_address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_location_address (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    address_1 text NOT NULL,
    address_2 text,
    company text,
    city text,
    country_code text NOT NULL,
    phone text,
    province text,
    postal_code text,
    metadata jsonb
);


ALTER TABLE public.stock_location_address OWNER TO postgres;

--
-- Name: stock_location_stock_location_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_location_stock_location_store_store (
    stock_location_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.stock_location_stock_location_store_store OWNER TO postgres;

--
-- Name: store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store (
    id text NOT NULL,
    name text DEFAULT 'Medusa Store'::text NOT NULL,
    default_sales_channel_id text,
    default_region_id text,
    default_location_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.store OWNER TO postgres;

--
-- Name: store_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_config (
    id text NOT NULL,
    medusa_store_id text NOT NULL,
    title text NOT NULL,
    handle text NOT NULL,
    domain text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    logo_url text,
    logo_alt text,
    favicon_url text,
    homepage_layout jsonb DEFAULT '{}'::jsonb NOT NULL,
    about_page_layout jsonb DEFAULT '{}'::jsonb NOT NULL,
    seo_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    marketing_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    subscription_product_id text,
    subscription_status text DEFAULT 'PENDING'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    theme text DEFAULT 'default'::text NOT NULL,
    theme_overrides jsonb DEFAULT '{}'::jsonb NOT NULL,
    payment_configs jsonb DEFAULT '{}'::jsonb NOT NULL,
    shipping_method_configs jsonb DEFAULT '{}'::jsonb NOT NULL,
    puck_data jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.store_config OWNER TO postgres;

--
-- Name: store_currency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_currency (
    id text NOT NULL,
    currency_code text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    store_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.store_currency OWNER TO postgres;

--
-- Name: store_locale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_locale (
    id text NOT NULL,
    locale_code text NOT NULL,
    store_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.store_locale OWNER TO postgres;

--
-- Name: storeconfigmodule_store_config_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.storeconfigmodule_store_config_store_store (
    store_config_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.storeconfigmodule_store_config_store_store OWNER TO postgres;

--
-- Name: subscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription (
    id text NOT NULL,
    reference text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    customer_id text NOT NULL,
    product_id text NOT NULL,
    variant_id text NOT NULL,
    frequency_interval text NOT NULL,
    frequency_value integer NOT NULL,
    started_at timestamp with time zone NOT NULL,
    next_renewal_at timestamp with time zone,
    last_renewal_at timestamp with time zone,
    paused_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancel_effective_at timestamp with time zone,
    skip_next_cycle boolean DEFAULT false NOT NULL,
    is_trial boolean DEFAULT false NOT NULL,
    trial_ends_at timestamp with time zone,
    customer_snapshot jsonb,
    product_snapshot jsonb NOT NULL,
    pricing_snapshot jsonb,
    shipping_address jsonb NOT NULL,
    pending_update_data jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    cart_id text,
    payment_context jsonb,
    CONSTRAINT subscription_frequency_interval_check CHECK ((frequency_interval = ANY (ARRAY['week'::text, 'month'::text, 'year'::text]))),
    CONSTRAINT subscription_status_check CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'cancelled'::text, 'past_due'::text])))
);


ALTER TABLE public.subscription OWNER TO postgres;

--
-- Name: subscription_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_log (
    id text NOT NULL,
    subscription_id text NOT NULL,
    customer_id text,
    event_type text NOT NULL,
    actor_type text NOT NULL,
    actor_id text,
    subscription_reference text NOT NULL,
    customer_name text,
    product_title text,
    variant_title text,
    reason text,
    dedupe_key text NOT NULL,
    previous_state jsonb,
    new_state jsonb,
    changed_fields jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT subscription_log_actor_type_check CHECK ((actor_type = ANY (ARRAY['user'::text, 'customer'::text, 'system'::text, 'scheduler'::text]))),
    CONSTRAINT subscription_log_event_type_check CHECK ((event_type = ANY (ARRAY['subscription.created'::text, 'subscription.paused'::text, 'subscription.resumed'::text, 'subscription.canceled'::text, 'subscription.plan_change_scheduled'::text, 'subscription.shipping_address_updated'::text, 'subscription.next_delivery_skipped'::text, 'renewal.cycle_created'::text, 'renewal.approval_approved'::text, 'renewal.approval_rejected'::text, 'renewal.force_requested'::text, 'renewal.succeeded'::text, 'renewal.failed'::text, 'dunning.started'::text, 'dunning.retry_executed'::text, 'dunning.recovered'::text, 'dunning.unrecovered'::text, 'dunning.retry_schedule_updated'::text, 'cancellation.case_started'::text, 'cancellation.offer_applied'::text, 'cancellation.reason_updated'::text, 'cancellation.finalized'::text])))
);


ALTER TABLE public.subscription_log OWNER TO postgres;

--
-- Name: subscription_metrics_daily; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_metrics_daily (
    id text NOT NULL,
    metric_date timestamp with time zone NOT NULL,
    subscription_id text NOT NULL,
    customer_id text NOT NULL,
    product_id text NOT NULL,
    variant_id text NOT NULL,
    status text NOT NULL,
    frequency_interval text NOT NULL,
    frequency_value integer NOT NULL,
    currency_code text,
    is_active boolean DEFAULT false NOT NULL,
    active_subscriptions_count integer DEFAULT 0 NOT NULL,
    mrr_amount numeric,
    churned_subscriptions_count integer DEFAULT 0 NOT NULL,
    churn_reason_category text,
    source_snapshot jsonb,
    metadata jsonb,
    raw_mrr_amount jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT subscription_metrics_daily_churn_reason_category_check CHECK ((churn_reason_category = ANY (ARRAY['price'::text, 'product_fit'::text, 'delivery'::text, 'billing'::text, 'temporary_pause'::text, 'switched_competitor'::text, 'other'::text]))),
    CONSTRAINT subscription_metrics_daily_frequency_interval_check CHECK ((frequency_interval = ANY (ARRAY['week'::text, 'month'::text, 'year'::text]))),
    CONSTRAINT subscription_metrics_daily_status_check CHECK ((status = ANY (ARRAY['active'::text, 'paused'::text, 'cancelled'::text, 'past_due'::text])))
);


ALTER TABLE public.subscription_metrics_daily OWNER TO postgres;

--
-- Name: subscription_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_settings (
    id text NOT NULL,
    settings_key text DEFAULT 'global'::text NOT NULL,
    default_trial_days integer DEFAULT 0 NOT NULL,
    dunning_retry_intervals jsonb NOT NULL,
    max_dunning_attempts integer DEFAULT 3 NOT NULL,
    default_renewal_behavior text DEFAULT 'process_immediately'::text NOT NULL,
    default_cancellation_behavior text DEFAULT 'recommend_retention_first'::text NOT NULL,
    version integer DEFAULT 0 NOT NULL,
    updated_by text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT subscription_settings_default_cancellation_behavior_check CHECK ((default_cancellation_behavior = ANY (ARRAY['recommend_retention_first'::text, 'allow_direct_cancellation'::text]))),
    CONSTRAINT subscription_settings_default_renewal_behavior_check CHECK ((default_renewal_behavior = ANY (ARRAY['process_immediately'::text, 'require_review_for_pending_changes'::text])))
);


ALTER TABLE public.subscription_settings OWNER TO postgres;

--
-- Name: subscription_subscription_cancellation_cancellation_case; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_subscription_cancellation_cancellation_case (
    subscription_id character varying(255) NOT NULL,
    cancellation_case_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.subscription_subscription_cancellation_cancellation_case OWNER TO postgres;

--
-- Name: subscription_subscription_cart_cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_subscription_cart_cart (
    subscription_id character varying(255) NOT NULL,
    cart_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.subscription_subscription_cart_cart OWNER TO postgres;

--
-- Name: subscription_subscription_customer_customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_subscription_customer_customer (
    subscription_id character varying(255) NOT NULL,
    customer_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.subscription_subscription_customer_customer OWNER TO postgres;

--
-- Name: subscription_subscription_order_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_subscription_order_order (
    subscription_id character varying(255) NOT NULL,
    order_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.subscription_subscription_order_order OWNER TO postgres;

--
-- Name: subscription_subscription_product_product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_subscription_product_product (
    subscription_id character varying(255) NOT NULL,
    product_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.subscription_subscription_product_product OWNER TO postgres;

--
-- Name: subscription_subscription_product_product_variant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_subscription_product_product_variant (
    subscription_id character varying(255) NOT NULL,
    product_variant_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.subscription_subscription_product_product_variant OWNER TO postgres;

--
-- Name: subscription_subscription_renewal_renewal_cycle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_subscription_renewal_renewal_cycle (
    subscription_id character varying(255) NOT NULL,
    renewal_cycle_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.subscription_subscription_renewal_renewal_cycle OWNER TO postgres;

--
-- Name: super_admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.super_admin (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.super_admin OWNER TO postgres;

--
-- Name: tax_provider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_provider (
    id text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tax_provider OWNER TO postgres;

--
-- Name: tax_rate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_rate (
    id text NOT NULL,
    rate real,
    code text NOT NULL,
    name text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    is_combinable boolean DEFAULT false NOT NULL,
    tax_region_id text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tax_rate OWNER TO postgres;

--
-- Name: tax_rate_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_rate_rule (
    id text NOT NULL,
    tax_rate_id text NOT NULL,
    reference_id text NOT NULL,
    reference text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tax_rate_rule OWNER TO postgres;

--
-- Name: tax_region; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_region (
    id text NOT NULL,
    provider_id text,
    country_code text NOT NULL,
    province_code text,
    parent_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by text,
    deleted_at timestamp with time zone,
    CONSTRAINT "CK_tax_region_country_top_level" CHECK (((parent_id IS NULL) OR (province_code IS NOT NULL))),
    CONSTRAINT "CK_tax_region_provider_top_level" CHECK (((parent_id IS NULL) OR (provider_id IS NULL)))
);


ALTER TABLE public.tax_region OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id text NOT NULL,
    first_name text,
    last_name text,
    email text NOT NULL,
    avatar_url text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_preference; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_preference (
    id text NOT NULL,
    user_id text NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.user_preference OWNER TO postgres;

--
-- Name: user_rbac_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_rbac_role (
    user_id character varying(255) NOT NULL,
    rbac_role_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.user_rbac_role OWNER TO postgres;

--
-- Name: user_user_store_store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_user_store_store (
    user_id character varying(255) NOT NULL,
    store_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.user_user_store_store OWNER TO postgres;

--
-- Name: user_user_super_admin_super_admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_user_super_admin_super_admin (
    user_id character varying(255) NOT NULL,
    super_admin_id character varying(255) NOT NULL,
    id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.user_user_super_admin_super_admin OWNER TO postgres;

--
-- Name: view_configuration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.view_configuration (
    id text NOT NULL,
    entity text NOT NULL,
    name text,
    user_id text,
    is_system_default boolean DEFAULT false NOT NULL,
    configuration jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.view_configuration OWNER TO postgres;

--
-- Name: workflow_execution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_execution (
    id character varying NOT NULL,
    workflow_id character varying NOT NULL,
    transaction_id character varying NOT NULL,
    execution jsonb,
    context jsonb,
    state character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone,
    retention_time integer,
    run_id text DEFAULT '01KWPMENGKWPDVC4RV9MWAV429'::text NOT NULL
);


ALTER TABLE public.workflow_execution OWNER TO postgres;

--
-- Name: link_module_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link_module_migrations ALTER COLUMN id SET DEFAULT nextval('public.link_module_migrations_id_seq'::regclass);


--
-- Name: mikro_orm_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mikro_orm_migrations ALTER COLUMN id SET DEFAULT nextval('public.mikro_orm_migrations_id_seq'::regclass);


--
-- Name: order display_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order" ALTER COLUMN display_id SET DEFAULT nextval('public.order_display_id_seq'::regclass);


--
-- Name: order_change_action ordering; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_change_action ALTER COLUMN ordering SET DEFAULT nextval('public.order_change_action_ordering_seq'::regclass);


--
-- Name: order_claim display_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_claim ALTER COLUMN display_id SET DEFAULT nextval('public.order_claim_display_id_seq'::regclass);


--
-- Name: order_exchange display_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_exchange ALTER COLUMN display_id SET DEFAULT nextval('public.order_exchange_display_id_seq'::regclass);


--
-- Name: return display_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return ALTER COLUMN display_id SET DEFAULT nextval('public.return_display_id_seq'::regclass);


--
-- Name: script_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.script_migrations ALTER COLUMN id SET DEFAULT nextval('public.script_migrations_id_seq'::regclass);


--
-- Data for Name: account_holder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_holder (id, provider_id, external_id, email, data, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: api_key; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_key (id, token, salt, redacted, title, type, last_used_at, created_by, created_at, revoked_by, revoked_at, updated_at, deleted_at) FROM stdin;
apk_01KWPMF6CNP8B7E1PPAEG4JAZ5	pk_7b25fc2232fc9401c42cde63f2ef3f3ce812a109aa87b4238cdaf89a7d6a4622		pk_7b2***622	Default Publishable API Key	publishable	\N		2026-07-04 13:18:14.933+00	\N	\N	2026-07-04 13:18:14.933+00	\N
\.


--
-- Data for Name: api_key_api_key_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.api_key_api_key_store_store (api_key_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: application_method_buy_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_method_buy_rules (application_method_id, promotion_rule_id) FROM stdin;
\.


--
-- Data for Name: application_method_target_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_method_target_rules (application_method_id, promotion_rule_id) FROM stdin;
\.


--
-- Data for Name: auth_identity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_identity (id, app_metadata, created_at, updated_at, deleted_at) FROM stdin;
authid_01KWPMHWRCK189M4K9GTVRGN1Q	{"user_id": "user_01KWPMHWGH240NRX0KYCEBYRC5"}	2026-07-04 13:19:43.373+00	2026-07-04 13:19:43.415+00	\N
authid_01KWQ6ZR3N4YNJ4JZ5KK1SG250	{"user_id": "user_01KWQ6ZQRF7AWZB0H21RNGA8EV"}	2026-07-04 18:41:51.734+00	2026-07-04 18:41:51.845+00	\N
authid_01KX1MP5AB3T92DBN65P4X2V3P	{"user_id": "user_01KX1MP50N2JHQWREQHZSRKN22"}	2026-07-08 19:53:41.963+00	2026-07-08 19:53:42.004+00	\N
\.


--
-- Data for Name: auth_mfa_factor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_mfa_factor (id, auth_identity_id, provider, status, provider_metadata, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: auth_mfa_recovery_code; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_mfa_recovery_code (id, auth_identity_id, code_hash, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: auth_password_reset_token; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_password_reset_token (id, auth_identity_id, provider_identity_id, entity_id, token_hash, expires_at, created_at, updated_at, deleted_at) FROM stdin;
authprt_01KXSVB0WEYQW8Y0HHFY84NSGN	authid_01KX1MP5AB3T92DBN65P4X2V3P	01KX1MP5AAQ67N9ZJKTETMZVS7	tabeshelecshop@gmail.com	de3ead0fb95878be8f2096048856c782125c0dac49acf7932fde46e30e9aaf97	2026-07-18 05:46:43.374+00	2026-07-18 05:31:43.375+00	2026-07-18 05:31:43.375+00	\N
\.


--
-- Data for Name: auth_verification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_verification (id, auth_identity_id, entity_id, entity_type, code_provider, verified_at, requested_at, provider_metadata, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: cancellation_case; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cancellation_case (id, subscription_id, status, reason, reason_category, notes, final_outcome, finalized_at, finalized_by, cancellation_effective_at, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: capture; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.capture (id, amount, raw_amount, payment_id, created_at, updated_at, deleted_at, created_by, metadata) FROM stdin;
\.


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart (id, region_id, customer_id, sales_channel_id, email, currency_code, shipping_address_id, billing_address_id, metadata, created_at, updated_at, deleted_at, completed_at, locale) FROM stdin;
\.


--
-- Data for Name: cart_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_address (id, customer_id, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: cart_line_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_line_item (id, cart_id, title, subtitle, thumbnail, quantity, variant_id, product_id, product_title, product_description, product_subtitle, product_type, product_collection, product_handle, variant_sku, variant_barcode, variant_title, variant_option_values, requires_shipping, is_discountable, is_tax_inclusive, compare_at_unit_price, raw_compare_at_unit_price, unit_price, raw_unit_price, metadata, created_at, updated_at, deleted_at, product_type_id, is_custom_price, is_giftcard) FROM stdin;
\.


--
-- Data for Name: cart_line_item_adjustment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_line_item_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, metadata, created_at, updated_at, deleted_at, item_id, is_tax_inclusive) FROM stdin;
\.


--
-- Data for Name: cart_line_item_tax_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_line_item_tax_line (id, description, tax_rate_id, code, rate, provider_id, metadata, created_at, updated_at, deleted_at, item_id) FROM stdin;
\.


--
-- Data for Name: cart_payment_collection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_payment_collection (cart_id, payment_collection_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: cart_promotion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_promotion (cart_id, promotion_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: cart_shipping_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_shipping_method (id, cart_id, name, description, amount, raw_amount, is_tax_inclusive, shipping_option_id, data, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: cart_shipping_method_adjustment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_shipping_method_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, metadata, created_at, updated_at, deleted_at, shipping_method_id) FROM stdin;
\.


--
-- Data for Name: cart_shipping_method_tax_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_shipping_method_tax_line (id, description, tax_rate_id, code, rate, provider_id, metadata, created_at, updated_at, deleted_at, shipping_method_id) FROM stdin;
\.


--
-- Data for Name: credit_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_line (id, cart_id, reference, reference_id, amount, raw_amount, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: currency; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.currency (code, symbol, symbol_native, decimal_digits, rounding, raw_rounding, name, created_at, updated_at, deleted_at) FROM stdin;
usd	$	$	2	0	{"value": "0", "precision": 20}	US Dollar	2026-07-04 13:18:12.496+00	2026-07-04 13:18:12.496+00	\N
cad	CA$	$	2	0	{"value": "0", "precision": 20}	Canadian Dollar	2026-07-04 13:18:12.498+00	2026-07-04 13:18:12.498+00	\N
eur	€	€	2	0	{"value": "0", "precision": 20}	Euro	2026-07-04 13:18:12.498+00	2026-07-04 13:18:12.498+00	\N
aed	AED	د.إ.‏	2	0	{"value": "0", "precision": 20}	United Arab Emirates Dirham	2026-07-04 13:18:12.498+00	2026-07-04 13:18:12.498+00	\N
afn	Af	؋	0	0	{"value": "0", "precision": 20}	Afghan Afghani	2026-07-04 13:18:12.498+00	2026-07-04 13:18:12.498+00	\N
all	ALL	Lek	0	0	{"value": "0", "precision": 20}	Albanian Lek	2026-07-04 13:18:12.498+00	2026-07-04 13:18:12.498+00	\N
amd	AMD	դր.	0	0	{"value": "0", "precision": 20}	Armenian Dram	2026-07-04 13:18:12.498+00	2026-07-04 13:18:12.498+00	\N
ars	AR$	$	2	0	{"value": "0", "precision": 20}	Argentine Peso	2026-07-04 13:18:12.498+00	2026-07-04 13:18:12.498+00	\N
aud	AU$	$	2	0	{"value": "0", "precision": 20}	Australian Dollar	2026-07-04 13:18:12.498+00	2026-07-04 13:18:12.498+00	\N
azn	man.	ман.	2	0	{"value": "0", "precision": 20}	Azerbaijani Manat	2026-07-04 13:18:12.499+00	2026-07-04 13:18:12.499+00	\N
bam	KM	KM	2	0	{"value": "0", "precision": 20}	Bosnia-Herzegovina Convertible Mark	2026-07-04 13:18:12.499+00	2026-07-04 13:18:12.499+00	\N
bdt	Tk	৳	2	0	{"value": "0", "precision": 20}	Bangladeshi Taka	2026-07-04 13:18:12.499+00	2026-07-04 13:18:12.499+00	\N
bgn	BGN	лв.	2	0	{"value": "0", "precision": 20}	Bulgarian Lev	2026-07-04 13:18:12.499+00	2026-07-04 13:18:12.499+00	\N
bhd	BD	د.ب.‏	3	0	{"value": "0", "precision": 20}	Bahraini Dinar	2026-07-04 13:18:12.499+00	2026-07-04 13:18:12.499+00	\N
bif	FBu	FBu	0	0	{"value": "0", "precision": 20}	Burundian Franc	2026-07-04 13:18:12.499+00	2026-07-04 13:18:12.499+00	\N
bnd	BN$	$	2	0	{"value": "0", "precision": 20}	Brunei Dollar	2026-07-04 13:18:12.499+00	2026-07-04 13:18:12.499+00	\N
bob	Bs	Bs	2	0	{"value": "0", "precision": 20}	Bolivian Boliviano	2026-07-04 13:18:12.5+00	2026-07-04 13:18:12.5+00	\N
brl	R$	R$	2	0	{"value": "0", "precision": 20}	Brazilian Real	2026-07-04 13:18:12.5+00	2026-07-04 13:18:12.5+00	\N
bwp	BWP	P	2	0	{"value": "0", "precision": 20}	Botswanan Pula	2026-07-04 13:18:12.5+00	2026-07-04 13:18:12.5+00	\N
byn	Br	руб.	2	0	{"value": "0", "precision": 20}	Belarusian Ruble	2026-07-04 13:18:12.5+00	2026-07-04 13:18:12.5+00	\N
bzd	BZ$	$	2	0	{"value": "0", "precision": 20}	Belize Dollar	2026-07-04 13:18:12.5+00	2026-07-04 13:18:12.5+00	\N
cdf	CDF	FrCD	2	0	{"value": "0", "precision": 20}	Congolese Franc	2026-07-04 13:18:12.5+00	2026-07-04 13:18:12.5+00	\N
chf	CHF	CHF	2	0.05	{"value": "0.05", "precision": 20}	Swiss Franc	2026-07-04 13:18:12.5+00	2026-07-04 13:18:12.5+00	\N
clp	CL$	$	0	0	{"value": "0", "precision": 20}	Chilean Peso	2026-07-04 13:18:12.5+00	2026-07-04 13:18:12.5+00	\N
cny	CN¥	CN¥	2	0	{"value": "0", "precision": 20}	Chinese Yuan	2026-07-04 13:18:12.5+00	2026-07-04 13:18:12.5+00	\N
cop	CO$	$	0	0	{"value": "0", "precision": 20}	Colombian Peso	2026-07-04 13:18:12.5+00	2026-07-04 13:18:12.5+00	\N
crc	₡	₡	0	0	{"value": "0", "precision": 20}	Costa Rican Colón	2026-07-04 13:18:12.501+00	2026-07-04 13:18:12.501+00	\N
cve	CV$	CV$	2	0	{"value": "0", "precision": 20}	Cape Verdean Escudo	2026-07-04 13:18:12.501+00	2026-07-04 13:18:12.501+00	\N
czk	Kč	Kč	2	0	{"value": "0", "precision": 20}	Czech Republic Koruna	2026-07-04 13:18:12.501+00	2026-07-04 13:18:12.501+00	\N
djf	Fdj	Fdj	0	0	{"value": "0", "precision": 20}	Djiboutian Franc	2026-07-04 13:18:12.501+00	2026-07-04 13:18:12.501+00	\N
dkk	Dkr	kr	2	0	{"value": "0", "precision": 20}	Danish Krone	2026-07-04 13:18:12.501+00	2026-07-04 13:18:12.501+00	\N
dop	RD$	RD$	2	0	{"value": "0", "precision": 20}	Dominican Peso	2026-07-04 13:18:12.501+00	2026-07-04 13:18:12.501+00	\N
dzd	DA	د.ج.‏	2	0	{"value": "0", "precision": 20}	Algerian Dinar	2026-07-04 13:18:12.501+00	2026-07-04 13:18:12.501+00	\N
eek	Ekr	kr	2	0	{"value": "0", "precision": 20}	Estonian Kroon	2026-07-04 13:18:12.501+00	2026-07-04 13:18:12.501+00	\N
egp	EGP	ج.م.‏	2	0	{"value": "0", "precision": 20}	Egyptian Pound	2026-07-04 13:18:12.501+00	2026-07-04 13:18:12.501+00	\N
ern	Nfk	Nfk	2	0	{"value": "0", "precision": 20}	Eritrean Nakfa	2026-07-04 13:18:12.501+00	2026-07-04 13:18:12.501+00	\N
etb	Br	Br	2	0	{"value": "0", "precision": 20}	Ethiopian Birr	2026-07-04 13:18:12.501+00	2026-07-04 13:18:12.501+00	\N
gbp	£	£	2	0	{"value": "0", "precision": 20}	British Pound Sterling	2026-07-04 13:18:12.502+00	2026-07-04 13:18:12.502+00	\N
gel	GEL	GEL	2	0	{"value": "0", "precision": 20}	Georgian Lari	2026-07-04 13:18:12.502+00	2026-07-04 13:18:12.502+00	\N
ghs	GH₵	GH₵	2	0	{"value": "0", "precision": 20}	Ghanaian Cedi	2026-07-04 13:18:12.502+00	2026-07-04 13:18:12.502+00	\N
gmd	D	D	2	0	{"value": "0", "precision": 20}	Gambian Dalasi	2026-07-04 13:18:12.502+00	2026-07-04 13:18:12.502+00	\N
gnf	FG	FG	0	0	{"value": "0", "precision": 20}	Guinean Franc	2026-07-04 13:18:12.502+00	2026-07-04 13:18:12.502+00	\N
gtq	GTQ	Q	2	0	{"value": "0", "precision": 20}	Guatemalan Quetzal	2026-07-04 13:18:12.502+00	2026-07-04 13:18:12.502+00	\N
hkd	HK$	$	2	0	{"value": "0", "precision": 20}	Hong Kong Dollar	2026-07-04 13:18:12.502+00	2026-07-04 13:18:12.502+00	\N
hnl	HNL	L	2	0	{"value": "0", "precision": 20}	Honduran Lempira	2026-07-04 13:18:12.502+00	2026-07-04 13:18:12.502+00	\N
hrk	kn	kn	2	0	{"value": "0", "precision": 20}	Croatian Kuna	2026-07-04 13:18:12.502+00	2026-07-04 13:18:12.502+00	\N
huf	Ft	Ft	0	0	{"value": "0", "precision": 20}	Hungarian Forint	2026-07-04 13:18:12.502+00	2026-07-04 13:18:12.502+00	\N
idr	Rp	Rp	0	0	{"value": "0", "precision": 20}	Indonesian Rupiah	2026-07-04 13:18:12.502+00	2026-07-04 13:18:12.502+00	\N
ils	₪	₪	2	0	{"value": "0", "precision": 20}	Israeli New Sheqel	2026-07-04 13:18:12.502+00	2026-07-04 13:18:12.502+00	\N
inr	Rs	₹	2	0	{"value": "0", "precision": 20}	Indian Rupee	2026-07-04 13:18:12.503+00	2026-07-04 13:18:12.503+00	\N
iqd	IQD	د.ع.‏	0	0	{"value": "0", "precision": 20}	Iraqi Dinar	2026-07-04 13:18:12.503+00	2026-07-04 13:18:12.503+00	\N
irr	IRR	﷼	0	0	{"value": "0", "precision": 20}	Iranian Rial	2026-07-04 13:18:12.503+00	2026-07-04 13:18:12.503+00	\N
isk	Ikr	kr	0	0	{"value": "0", "precision": 20}	Icelandic Króna	2026-07-04 13:18:12.503+00	2026-07-04 13:18:12.503+00	\N
jmd	J$	$	2	0	{"value": "0", "precision": 20}	Jamaican Dollar	2026-07-04 13:18:12.503+00	2026-07-04 13:18:12.503+00	\N
jod	JD	د.أ.‏	3	0	{"value": "0", "precision": 20}	Jordanian Dinar	2026-07-04 13:18:12.503+00	2026-07-04 13:18:12.503+00	\N
jpy	¥	￥	0	0	{"value": "0", "precision": 20}	Japanese Yen	2026-07-04 13:18:12.503+00	2026-07-04 13:18:12.503+00	\N
kes	Ksh	Ksh	2	0	{"value": "0", "precision": 20}	Kenyan Shilling	2026-07-04 13:18:12.503+00	2026-07-04 13:18:12.503+00	\N
khr	KHR	៛	2	0	{"value": "0", "precision": 20}	Cambodian Riel	2026-07-04 13:18:12.503+00	2026-07-04 13:18:12.503+00	\N
kmf	CF	FC	0	0	{"value": "0", "precision": 20}	Comorian Franc	2026-07-04 13:18:12.503+00	2026-07-04 13:18:12.503+00	\N
krw	₩	₩	0	0	{"value": "0", "precision": 20}	South Korean Won	2026-07-04 13:18:12.503+00	2026-07-04 13:18:12.503+00	\N
kwd	KD	د.ك.‏	3	0	{"value": "0", "precision": 20}	Kuwaiti Dinar	2026-07-04 13:18:12.503+00	2026-07-04 13:18:12.503+00	\N
kzt	KZT	тңг.	2	0	{"value": "0", "precision": 20}	Kazakhstani Tenge	2026-07-04 13:18:12.504+00	2026-07-04 13:18:12.504+00	\N
lbp	LB£	ل.ل.‏	0	0	{"value": "0", "precision": 20}	Lebanese Pound	2026-07-04 13:18:12.504+00	2026-07-04 13:18:12.504+00	\N
lkr	SLRs	SL Re	2	0	{"value": "0", "precision": 20}	Sri Lankan Rupee	2026-07-04 13:18:12.504+00	2026-07-04 13:18:12.504+00	\N
ltl	Lt	Lt	2	0	{"value": "0", "precision": 20}	Lithuanian Litas	2026-07-04 13:18:12.504+00	2026-07-04 13:18:12.504+00	\N
lvl	Ls	Ls	2	0	{"value": "0", "precision": 20}	Latvian Lats	2026-07-04 13:18:12.504+00	2026-07-04 13:18:12.504+00	\N
lyd	LD	د.ل.‏	3	0	{"value": "0", "precision": 20}	Libyan Dinar	2026-07-04 13:18:12.504+00	2026-07-04 13:18:12.504+00	\N
mad	MAD	د.م.‏	2	0	{"value": "0", "precision": 20}	Moroccan Dirham	2026-07-04 13:18:12.504+00	2026-07-04 13:18:12.504+00	\N
mdl	MDL	MDL	2	0	{"value": "0", "precision": 20}	Moldovan Leu	2026-07-04 13:18:12.504+00	2026-07-04 13:18:12.504+00	\N
mga	MGA	MGA	0	0	{"value": "0", "precision": 20}	Malagasy Ariary	2026-07-04 13:18:12.504+00	2026-07-04 13:18:12.504+00	\N
mkd	MKD	MKD	2	0	{"value": "0", "precision": 20}	Macedonian Denar	2026-07-04 13:18:12.504+00	2026-07-04 13:18:12.504+00	\N
mmk	MMK	K	0	0	{"value": "0", "precision": 20}	Myanma Kyat	2026-07-04 13:18:12.505+00	2026-07-04 13:18:12.505+00	\N
mnt	MNT	₮	0	0	{"value": "0", "precision": 20}	Mongolian Tugrig	2026-07-04 13:18:12.505+00	2026-07-04 13:18:12.505+00	\N
mop	MOP$	MOP$	2	0	{"value": "0", "precision": 20}	Macanese Pataca	2026-07-04 13:18:12.505+00	2026-07-04 13:18:12.505+00	\N
mur	MURs	MURs	0	0	{"value": "0", "precision": 20}	Mauritian Rupee	2026-07-04 13:18:12.505+00	2026-07-04 13:18:12.505+00	\N
mwk	K	K	2	0	{"value": "0", "precision": 20}	Malawian Kwacha	2026-07-04 13:18:12.505+00	2026-07-04 13:18:12.505+00	\N
mxn	MX$	$	2	0	{"value": "0", "precision": 20}	Mexican Peso	2026-07-04 13:18:12.505+00	2026-07-04 13:18:12.505+00	\N
myr	RM	RM	2	0	{"value": "0", "precision": 20}	Malaysian Ringgit	2026-07-04 13:18:12.505+00	2026-07-04 13:18:12.505+00	\N
mzn	MTn	MTn	2	0	{"value": "0", "precision": 20}	Mozambican Metical	2026-07-04 13:18:12.505+00	2026-07-04 13:18:12.505+00	\N
nad	N$	N$	2	0	{"value": "0", "precision": 20}	Namibian Dollar	2026-07-04 13:18:12.505+00	2026-07-04 13:18:12.505+00	\N
ngn	₦	₦	2	0	{"value": "0", "precision": 20}	Nigerian Naira	2026-07-04 13:18:12.505+00	2026-07-04 13:18:12.505+00	\N
nio	C$	C$	2	0	{"value": "0", "precision": 20}	Nicaraguan Córdoba	2026-07-04 13:18:12.505+00	2026-07-04 13:18:12.505+00	\N
nok	Nkr	kr	2	0	{"value": "0", "precision": 20}	Norwegian Krone	2026-07-04 13:18:12.505+00	2026-07-04 13:18:12.505+00	\N
npr	NPRs	नेरू	2	0	{"value": "0", "precision": 20}	Nepalese Rupee	2026-07-04 13:18:12.506+00	2026-07-04 13:18:12.506+00	\N
nzd	NZ$	$	2	0	{"value": "0", "precision": 20}	New Zealand Dollar	2026-07-04 13:18:12.506+00	2026-07-04 13:18:12.506+00	\N
omr	OMR	ر.ع.‏	3	0	{"value": "0", "precision": 20}	Omani Rial	2026-07-04 13:18:12.506+00	2026-07-04 13:18:12.506+00	\N
pab	B/.	B/.	2	0	{"value": "0", "precision": 20}	Panamanian Balboa	2026-07-04 13:18:12.506+00	2026-07-04 13:18:12.506+00	\N
pen	S/.	S/.	2	0	{"value": "0", "precision": 20}	Peruvian Nuevo Sol	2026-07-04 13:18:12.506+00	2026-07-04 13:18:12.506+00	\N
php	₱	₱	2	0	{"value": "0", "precision": 20}	Philippine Peso	2026-07-04 13:18:12.507+00	2026-07-04 13:18:12.507+00	\N
pkr	PKRs	₨	0	0	{"value": "0", "precision": 20}	Pakistani Rupee	2026-07-04 13:18:12.507+00	2026-07-04 13:18:12.507+00	\N
pln	zł	zł	2	0	{"value": "0", "precision": 20}	Polish Zloty	2026-07-04 13:18:12.507+00	2026-07-04 13:18:12.507+00	\N
pyg	₲	₲	0	0	{"value": "0", "precision": 20}	Paraguayan Guarani	2026-07-04 13:18:12.507+00	2026-07-04 13:18:12.507+00	\N
qar	QR	ر.ق.‏	2	0	{"value": "0", "precision": 20}	Qatari Rial	2026-07-04 13:18:12.507+00	2026-07-04 13:18:12.507+00	\N
ron	RON	RON	2	0	{"value": "0", "precision": 20}	Romanian Leu	2026-07-04 13:18:12.507+00	2026-07-04 13:18:12.507+00	\N
rsd	din.	дин.	0	0	{"value": "0", "precision": 20}	Serbian Dinar	2026-07-04 13:18:12.507+00	2026-07-04 13:18:12.507+00	\N
rub	RUB	₽.	2	0	{"value": "0", "precision": 20}	Russian Ruble	2026-07-04 13:18:12.507+00	2026-07-04 13:18:12.507+00	\N
rwf	RWF	FR	0	0	{"value": "0", "precision": 20}	Rwandan Franc	2026-07-04 13:18:12.508+00	2026-07-04 13:18:12.508+00	\N
sar	SR	ر.س.‏	2	0	{"value": "0", "precision": 20}	Saudi Riyal	2026-07-04 13:18:12.508+00	2026-07-04 13:18:12.508+00	\N
sdg	SDG	SDG	2	0	{"value": "0", "precision": 20}	Sudanese Pound	2026-07-04 13:18:12.508+00	2026-07-04 13:18:12.508+00	\N
sek	Skr	kr	2	0	{"value": "0", "precision": 20}	Swedish Krona	2026-07-04 13:18:12.508+00	2026-07-04 13:18:12.508+00	\N
sgd	S$	$	2	0	{"value": "0", "precision": 20}	Singapore Dollar	2026-07-04 13:18:12.508+00	2026-07-04 13:18:12.508+00	\N
sos	Ssh	Ssh	0	0	{"value": "0", "precision": 20}	Somali Shilling	2026-07-04 13:18:12.508+00	2026-07-04 13:18:12.508+00	\N
syp	SY£	ل.س.‏	0	0	{"value": "0", "precision": 20}	Syrian Pound	2026-07-04 13:18:12.508+00	2026-07-04 13:18:12.508+00	\N
thb	฿	฿	2	0	{"value": "0", "precision": 20}	Thai Baht	2026-07-04 13:18:12.508+00	2026-07-04 13:18:12.508+00	\N
tnd	DT	د.ت.‏	3	0	{"value": "0", "precision": 20}	Tunisian Dinar	2026-07-04 13:18:12.508+00	2026-07-04 13:18:12.508+00	\N
top	T$	T$	2	0	{"value": "0", "precision": 20}	Tongan Paʻanga	2026-07-04 13:18:12.509+00	2026-07-04 13:18:12.509+00	\N
tjs	TJS	с.	2	0	{"value": "0", "precision": 20}	Tajikistani Somoni	2026-07-04 13:18:12.509+00	2026-07-04 13:18:12.509+00	\N
try	₺	₺	2	0	{"value": "0", "precision": 20}	Turkish Lira	2026-07-04 13:18:12.509+00	2026-07-04 13:18:12.509+00	\N
ttd	TT$	$	2	0	{"value": "0", "precision": 20}	Trinidad and Tobago Dollar	2026-07-04 13:18:12.509+00	2026-07-04 13:18:12.509+00	\N
twd	NT$	NT$	2	0	{"value": "0", "precision": 20}	New Taiwan Dollar	2026-07-04 13:18:12.509+00	2026-07-04 13:18:12.509+00	\N
tzs	TSh	TSh	0	0	{"value": "0", "precision": 20}	Tanzanian Shilling	2026-07-04 13:18:12.509+00	2026-07-04 13:18:12.509+00	\N
uah	₴	₴	2	0	{"value": "0", "precision": 20}	Ukrainian Hryvnia	2026-07-04 13:18:12.509+00	2026-07-04 13:18:12.509+00	\N
ugx	USh	USh	0	0	{"value": "0", "precision": 20}	Ugandan Shilling	2026-07-04 13:18:12.509+00	2026-07-04 13:18:12.509+00	\N
uyu	$U	$	2	0	{"value": "0", "precision": 20}	Uruguayan Peso	2026-07-04 13:18:12.509+00	2026-07-04 13:18:12.509+00	\N
uzs	UZS	UZS	0	0	{"value": "0", "precision": 20}	Uzbekistan Som	2026-07-04 13:18:12.51+00	2026-07-04 13:18:12.51+00	\N
vef	Bs.F.	Bs.F.	2	0	{"value": "0", "precision": 20}	Venezuelan Bolívar	2026-07-04 13:18:12.51+00	2026-07-04 13:18:12.51+00	\N
vnd	₫	₫	0	0	{"value": "0", "precision": 20}	Vietnamese Dong	2026-07-04 13:18:12.51+00	2026-07-04 13:18:12.51+00	\N
xaf	FCFA	FCFA	0	0	{"value": "0", "precision": 20}	CFA Franc BEAC	2026-07-04 13:18:12.51+00	2026-07-04 13:18:12.51+00	\N
xof	CFA	CFA	0	0	{"value": "0", "precision": 20}	CFA Franc BCEAO	2026-07-04 13:18:12.51+00	2026-07-04 13:18:12.51+00	\N
xpf	₣	₣	0	0	{"value": "0", "precision": 20}	CFP Franc	2026-07-04 13:18:12.51+00	2026-07-04 13:18:12.51+00	\N
yer	YR	ر.ي.‏	0	0	{"value": "0", "precision": 20}	Yemeni Rial	2026-07-04 13:18:12.51+00	2026-07-04 13:18:12.51+00	\N
zar	R	R	2	0	{"value": "0", "precision": 20}	South African Rand	2026-07-04 13:18:12.51+00	2026-07-04 13:18:12.51+00	\N
zmk	ZK	ZK	0	0	{"value": "0", "precision": 20}	Zambian Kwacha	2026-07-04 13:18:12.51+00	2026-07-04 13:18:12.51+00	\N
zwl	ZWL$	ZWL$	0	0	{"value": "0", "precision": 20}	Zimbabwean Dollar	2026-07-04 13:18:12.514+00	2026-07-04 13:18:12.514+00	\N
\.


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer (id, company_name, first_name, last_name, email, phone, has_account, metadata, created_at, updated_at, deleted_at, created_by) FROM stdin;
\.


--
-- Data for Name: customer_account_holder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_account_holder (customer_id, account_holder_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: customer_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_address (id, customer_id, address_name, is_default_shipping, is_default_billing, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: customer_customer_sales_channel_sales_channel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_customer_sales_channel_sales_channel (customer_id, sales_channel_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: customer_customer_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_customer_store_store (customer_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: customer_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_group (id, name, metadata, created_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: customer_group_customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_group_customer (id, customer_id, customer_group_id, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: dunning_attempt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dunning_attempt (id, dunning_case_id, attempt_no, started_at, finished_at, status, error_code, error_message, payment_reference, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: dunning_case; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dunning_case (id, subscription_id, renewal_cycle_id, renewal_order_id, status, attempt_count, max_attempts, retry_schedule, next_retry_at, last_payment_error_code, last_payment_error_message, last_attempt_at, recovered_at, closed_at, recovery_reason, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: fulfillment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment (id, location_id, packed_at, shipped_at, delivered_at, canceled_at, data, provider_id, shipping_option_id, metadata, delivery_address_id, created_at, updated_at, deleted_at, marked_shipped_by, created_by, requires_shipping) FROM stdin;
\.


--
-- Data for Name: fulfillment_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_address (id, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: fulfillment_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_item (id, title, sku, barcode, quantity, raw_quantity, line_item_id, inventory_item_id, fulfillment_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: fulfillment_label; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_label (id, tracking_number, tracking_url, label_url, fulfillment_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: fulfillment_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_provider (id, is_enabled, created_at, updated_at, deleted_at) FROM stdin;
manual_manual	t	2026-07-04 13:18:12.65+00	2026-07-04 13:18:12.65+00	\N
\.


--
-- Data for Name: fulfillment_set; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_set (id, name, type, metadata, created_at, updated_at, deleted_at) FROM stdin;
fuset_01KWPMF6VYP7C9E5QDXZN87ZZN	Iranian Warehouse delivery	shipping	\N	2026-07-04 13:18:15.423+00	2026-07-04 13:18:15.423+00	\N
fuset_01KX2X74HVYACSTBABZ0ZAZMZT	انبار دهاقان pick up	pickup	\N	2026-07-09 07:42:01.276+00	2026-07-09 07:42:11.782+00	2026-07-09 07:42:11.78+00
fuset_01KX2X7H94CS9DB34C9C566KGG	انبار دهاقان shipping	shipping	\N	2026-07-09 07:42:14.309+00	2026-07-09 07:42:14.309+00	\N
fuset_01KX2XVKC7NW7SCMWZEY1D9DDV	انبار دهاقان pick up	pickup	\N	2026-07-09 07:53:11.816+00	2026-07-09 07:53:11.816+00	\N
\.


--
-- Data for Name: fulfillment_shipping_profile_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fulfillment_shipping_profile_store_store (shipping_profile_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
sp_01KX2X4AT0B192TBXFVQW1CKPP	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KX2X4AV3VHQME1JB3W6FBCVB	2026-07-09 07:40:29.409275+00	2026-07-09 07:40:29.409275+00	\N
sp_01KX2X561R7XT7FWKJP16G9G4F	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KX2X562GHC7H584PCTXF689F	2026-07-09 07:40:57.295776+00	2026-07-09 07:40:57.295776+00	\N
\.


--
-- Data for Name: geo_zone; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.geo_zone (id, type, country_code, province_code, city, service_zone_id, postal_expression, metadata, created_at, updated_at, deleted_at) FROM stdin;
fgz_01KWPMF6VVRS9H4THWHMFTKT55	country	ir	\N	\N	serzo_01KWPMF6VY06FHGR56099MR95Y	\N	\N	2026-07-04 13:18:15.424+00	2026-07-04 13:18:15.424+00	\N
fgz_01KX2X8HDBR2NSDGCRW617XK9S	country	ir	\N	\N	serzo_01KX2X8HDCMKJS2HW5QKBHGGC7	\N	\N	2026-07-09 07:42:47.214+00	2026-07-09 07:42:47.214+00	\N
fgz_01KX2XW7QMBG8FRVF2JZ9PZ8XJ	country	ir	\N	\N	serzo_01KX2XW7QMSVGESYCT520WDG7J	\N	\N	2026-07-09 07:53:32.661+00	2026-07-09 07:55:25.338+00	2026-07-09 07:55:25.32+00
fgz_01KX2Y0P6JHQ98M2HE35RF60EX	country	ir	\N	\N	serzo_01KX2Y0P6KRVWQR3SQT8J9XTSJ	\N	\N	2026-07-09 07:55:58.548+00	2026-07-09 07:55:58.548+00	\N
\.


--
-- Data for Name: image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.image (id, url, metadata, created_at, updated_at, deleted_at, rank, product_id) FROM stdin;
img_01KZ3SYWZMATCNB8ZVJ96VCQNC	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ3SYWSGBD4C4Y6TDDN0JWAZ.webp	\N	2026-08-03 12:35:43.738+00	2026-08-03 12:35:43.738+00	\N	0	prod_01KZ3SYWZB87P57Z1PD0T5RH7Z
img_01KZ3TGWQEJRH6D3Y9E59TQ8WD	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ3TGWKMWMAJ0MSDSGXXTCY0.webp	\N	2026-08-03 12:45:33.297+00	2026-08-03 12:45:33.297+00	\N	0	prod_01KZ3TGWQD1T8ZD99PE1T4R138
yt2kka	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ3TS9D03HPP0HGZD4K942CB.webp	\N	2026-08-03 12:50:08.592+00	2026-08-03 12:50:42.598+00	2026-08-03 12:50:42.559+00	0	prod_01KZ3TM3TF40YQW5F6FEDZCNB3
img_01KZ3TWFAWD51S1H4DS5ZYEKH6	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ3TWF5YBE9NYRAKM5FWASY7.webp	\N	2026-08-03 12:51:52.801+00	2026-08-03 12:51:52.801+00	\N	0	prod_01KZ3TWFAVPDMVXWAEZYFBZJ5P
img_01KZ3TZ12RNY7M9B876WWDXGSK	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ3TZ0XJYS5H8C515XD5XZMC.webp	\N	2026-08-03 12:53:16.511+00	2026-08-03 12:53:16.511+00	\N	0	prod_01KZ3TZ12N3Y3HAW8DENA6M1QQ
img_01KZ5TBATDEKY7G3VRED269BEM	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__145-01KZ5TBANNP9WSX96JVH2D7A3M.webp	\N	2026-08-04 07:20:59.986+00	2026-08-04 07:20:59.986+00	\N	0	prod_01KZ5TBAT4SKW78XCV56FM5JRD
img_01KZ5TFPDYY7JB5MP5EW81MAK3	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__145-01KZ5TFPA17251F50G097EFH4F.webp	\N	2026-08-04 07:23:22.945+00	2026-08-04 07:23:22.945+00	\N	0	prod_01KZ5TFPDWS8KJAK5MSEN8GHH4
img_01KZ5TH6TD2F3J8E1FGV3XF799	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__145-01KZ5TH6PWZW7XQ1YRR7JATX35.webp	\N	2026-08-04 07:24:12.499+00	2026-08-04 07:24:12.499+00	\N	0	prod_01KZ5TH6TB2WG4D4P03SKRCG4M
img_01KZ5TNNK67FXR1XRKYVSFR61Q	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ5TNNF87EHKDC4DQXQ44FHF.webp	\N	2026-08-04 07:26:38.697+00	2026-08-04 07:26:38.697+00	\N	0	prod_01KZ5TNNK4J4CFBE09JCFE728E
img_01KZ5TR9KMMXWEJ2SXCYR94R89	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ5TR9G86YCAQ1YZ7PY5WBQP.webp	\N	2026-08-04 07:28:04.727+00	2026-08-04 07:28:04.727+00	\N	0	prod_01KZ5TR9KKNDKZ1809RX9ECMXC
img_01KZ5TTMM39WXYD6D5BHKJ0QV1	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ5TTMFKX3PEFGNFZ34E37ZP.webp	\N	2026-08-04 07:29:21.542+00	2026-08-04 07:29:21.542+00	\N	0	prod_01KZ5TTMM17296PHA0QDNHEHKY
img_01KZ5TXDB2G6PKZ04757NP5Q4E	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ5TXD7DXRK0ABZDR6DZRYGQ.webp	\N	2026-08-04 07:30:52.389+00	2026-08-04 07:30:52.389+00	\N	0	prod_01KZ5TXDB07KDZ89FJ0MTRYAKJ
img_01KZ5TYYJYTXTGR1ECCZ5CXSBT	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ5TYYF86KWFZ19HJ1SZKFWB.webp	\N	2026-08-04 07:31:42.818+00	2026-08-04 07:31:42.818+00	\N	0	prod_01KZ5TYYJWMGQ76KH4EN1ZK14R
\.


--
-- Data for Name: inventory_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_item (id, created_at, updated_at, deleted_at, sku, origin_country, hs_code, mid_code, material, weight, length, height, width, requires_shipping, description, title, thumbnail, metadata) FROM stdin;
iitem_01KZ3TGWZ9BP95J2MD69ZYPM74	2026-08-03 12:45:33.546+00	2026-08-03 12:45:33.546+00	\N	024001010	\N	\N	\N	\N	\N	\N	\N	\N	t	Default variant	Default variant	\N	\N
iitem_01KZ3TM3YWKQ3MG9T63CR9ZJW2	2026-08-03 12:47:19.005+00	2026-08-03 12:50:42.49+00	2026-08-03 12:50:42.49+00	024001011	\N	\N	\N	\N	\N	\N	\N	\N	t	Default variant	Default variant	\N	\N
iitem_01KZ3TWFJGN5RD5GXTSSGHSCQB	2026-08-03 12:51:53.041+00	2026-08-03 12:51:53.041+00	\N	024001011	\N	\N	\N	\N	\N	\N	\N	\N	t	Default variant	Default variant	\N	\N
iitem_01KZ3TZ1EEYCX12Z6CXSSQNCSM	2026-08-03 12:53:16.879+00	2026-08-03 12:53:16.879+00	\N	024001012	\N	\N	\N	\N	\N	\N	\N	\N	t	Default variant	Default variant	\N	\N
iitem_01KZ5TBB0ET8HJZGPQBWT8TAW6	2026-08-04 07:21:00.175+00	2026-08-04 07:21:00.175+00	\N	024001013	\N	\N	\N	\N	\N	\N	\N	\N	t	Default variant	Default variant	\N	\N
iitem_01KZ5TFPKA203EPKFGE1MXCSFH	2026-08-04 07:23:23.115+00	2026-08-04 07:23:23.115+00	\N	024001014	\N	\N	\N	\N	\N	\N	\N	\N	t	Default variant	Default variant	\N	\N
iitem_01KZ5TH70SJFW007MAG1EEJ1Q1	2026-08-04 07:24:12.698+00	2026-08-04 07:24:12.698+00	\N	024001015	\N	\N	\N	\N	\N	\N	\N	\N	t	Default variant	Default variant	\N	\N
iitem_01KZ5TNNRVEN5YCSSS0DQB9RQG	2026-08-04 07:26:38.876+00	2026-08-04 07:26:38.876+00	\N	024001016	\N	\N	\N	\N	\N	\N	\N	\N	t	Default variant	Default variant	\N	\N
iitem_01KZ5TR9S74VB1RWNSV5ZXP0BJ	2026-08-04 07:28:04.903+00	2026-08-04 07:28:04.903+00	\N	024001017	\N	\N	\N	\N	\N	\N	\N	\N	t	Default variant	Default variant	\N	\N
iitem_01KZ5TTMS78ZCZP814HWX26JEF	2026-08-04 07:29:21.704+00	2026-08-04 07:29:21.704+00	\N	024001018	\N	\N	\N	\N	\N	\N	\N	\N	t	Default variant	Default variant	\N	\N
iitem_01KZ5TXDGRDHW61K1BWKXWN811	2026-08-04 07:30:52.568+00	2026-08-04 07:30:52.568+00	\N	024001019	\N	\N	\N	\N	\N	\N	\N	\N	t	Default variant	Default variant	\N	\N
iitem_01KZ5TYYQYBVC8QP177HNS0QBB	2026-08-04 07:31:42.975+00	2026-08-04 07:31:42.975+00	\N	024001020	\N	\N	\N	\N	\N	\N	\N	\N	t	Default variant	Default variant	\N	\N
\.


--
-- Data for Name: inventory_level; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_level (id, created_at, updated_at, deleted_at, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, metadata, raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity) FROM stdin;
\.


--
-- Data for Name: invite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invite (id, email, accepted, token, expires_at, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: invite_rbac_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invite_rbac_role (invite_id, rbac_role_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: link_module_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.link_module_migrations (id, table_name, link_descriptor, created_at) FROM stdin;
1	cart_payment_collection	{"toModel": "payment_collection", "toModule": "payment", "fromModel": "cart", "fromModule": "cart"}	2026-07-04 13:18:00.242124
2	cart_promotion	{"toModel": "promotions", "toModule": "promotion", "fromModel": "cart", "fromModule": "cart"}	2026-07-04 13:18:00.310616
3	customer_account_holder	{"toModel": "account_holder", "toModule": "payment", "fromModel": "customer", "fromModule": "customer"}	2026-07-04 13:18:00.379829
4	location_fulfillment_provider	{"toModel": "fulfillment_provider", "toModule": "fulfillment", "fromModel": "location", "fromModule": "stock_location"}	2026-07-04 13:18:00.446341
5	location_fulfillment_set	{"toModel": "fulfillment_set", "toModule": "fulfillment", "fromModel": "location", "fromModule": "stock_location"}	2026-07-04 13:18:00.510424
6	invite_rbac_role	{"toModel": "rbac_role", "toModule": "rbac", "fromModel": "invite", "fromModule": "user"}	2026-07-04 13:18:00.583108
7	order_cart	{"toModel": "cart", "toModule": "cart", "fromModel": "order", "fromModule": "order"}	2026-07-04 13:18:00.738364
8	order_fulfillment	{"toModel": "fulfillments", "toModule": "fulfillment", "fromModel": "order", "fromModule": "order"}	2026-07-04 13:18:00.803856
9	order_payment_collection	{"toModel": "payment_collection", "toModule": "payment", "fromModel": "order", "fromModule": "order"}	2026-07-04 13:18:00.869914
10	order_promotion	{"toModel": "promotions", "toModule": "promotion", "fromModel": "order", "fromModule": "order"}	2026-07-04 13:18:00.935874
11	return_fulfillment	{"toModel": "fulfillments", "toModule": "fulfillment", "fromModel": "return", "fromModule": "order"}	2026-07-04 13:18:01.002662
12	product_sales_channel	{"toModel": "sales_channel", "toModule": "sales_channel", "fromModel": "product", "fromModule": "product"}	2026-07-04 13:18:01.074491
13	product_shipping_profile	{"toModel": "shipping_profile", "toModule": "fulfillment", "fromModel": "product", "fromModule": "product"}	2026-07-04 13:18:01.153286
14	product_variant_inventory_item	{"toModel": "inventory", "toModule": "inventory", "fromModel": "variant", "fromModule": "product"}	2026-07-04 13:18:01.226465
15	product_variant_price_set	{"toModel": "price_set", "toModule": "pricing", "fromModel": "variant", "fromModule": "product"}	2026-07-04 13:18:01.299803
16	publishable_api_key_sales_channel	{"toModel": "sales_channel", "toModule": "sales_channel", "fromModel": "api_key", "fromModule": "api_key"}	2026-07-04 13:18:01.369427
17	region_payment_provider	{"toModel": "payment_provider", "toModule": "payment", "fromModel": "region", "fromModule": "region"}	2026-07-04 13:18:01.437153
18	sales_channel_stock_location	{"toModel": "location", "toModule": "stock_location", "fromModel": "sales_channel", "fromModule": "sales_channel"}	2026-07-04 13:18:01.529915
19	shipping_option_price_set	{"toModel": "price_set", "toModule": "pricing", "fromModel": "shipping_option", "fromModule": "fulfillment"}	2026-07-04 13:18:01.600685
20	user_rbac_role	{"toModel": "rbac_role", "toModule": "rbac", "fromModel": "user", "fromModule": "user"}	2026-07-04 13:18:01.671483
21	subscription_subscription_cancellation_cancellation_case	{"toModel": "cancellation_case", "toModule": "cancellation", "fromModel": "subscription", "fromModule": "subscription"}	2026-07-04 13:18:01.737075
22	renewal_renewal_cycle_order_order	{"toModel": "order", "toModule": "order", "fromModel": "renewal_cycle", "fromModule": "renewal"}	2026-07-04 13:18:01.808418
23	subscription_subscription_renewal_renewal_cycle	{"toModel": "renewal_cycle", "toModule": "renewal", "fromModel": "subscription", "fromModule": "subscription"}	2026-07-04 13:18:01.877101
24	subscription_subscription_cart_cart	{"toModel": "cart", "toModule": "cart", "fromModel": "subscription", "fromModule": "subscription"}	2026-07-04 13:18:01.949671
25	subscription_subscription_customer_customer	{"toModel": "customer", "toModule": "customer", "fromModel": "subscription", "fromModule": "subscription"}	2026-07-04 13:18:02.020423
26	subscription_subscription_order_order	{"toModel": "order", "toModule": "order", "fromModel": "subscription", "fromModule": "subscription"}	2026-07-04 13:18:02.212791
27	subscription_subscription_product_product	{"toModel": "product", "toModule": "product", "fromModel": "subscription", "fromModule": "subscription"}	2026-07-04 13:18:02.334834
28	subscription_subscription_product_product_variant	{"toModel": "product_variant", "toModule": "product", "fromModel": "subscription", "fromModule": "subscription"}	2026-07-04 13:18:02.457925
29	api_key_api_key_store_store	{"toModel": "store", "toModule": "store", "fromModel": "api_key", "fromModule": "api_key"}	2026-07-04 13:18:02.524926
30	promotion_campaign_store_store	{"toModel": "store", "toModule": "store", "fromModel": "campaign", "fromModule": "promotion"}	2026-07-04 13:18:02.590736
31	product_product_collection_store_store	{"toModel": "store", "toModule": "store", "fromModel": "product_collection", "fromModule": "product"}	2026-07-04 13:18:02.658194
32	customer_customer_sales_channel_sales_channel	{"toModel": "sales_channel", "toModule": "sales_channel", "fromModel": "customer", "fromModule": "customer"}	2026-07-04 13:18:02.72353
33	customer_customer_store_store	{"toModel": "store", "toModule": "store", "fromModel": "customer", "fromModule": "customer"}	2026-07-04 13:18:02.790057
34	order_order_store_store	{"toModel": "store", "toModule": "store", "fromModel": "order", "fromModule": "order"}	2026-07-04 13:18:02.857009
35	pricing_price_list_store_store	{"toModel": "store", "toModule": "store", "fromModel": "price_list", "fromModule": "pricing"}	2026-07-04 13:18:02.925116
36	product_product_store_store	{"toModel": "store", "toModule": "store", "fromModel": "product", "fromModule": "product"}	2026-07-04 13:18:02.993824
37	promotion_promotion_store_store	{"toModel": "store", "toModule": "store", "fromModel": "promotion", "fromModule": "promotion"}	2026-07-04 13:18:03.060037
38	fulfillment_shipping_profile_store_store	{"toModel": "store", "toModule": "store", "fromModel": "shipping_profile", "fromModule": "fulfillment"}	2026-07-04 13:18:03.122191
39	stock_location_stock_location_store_store	{"toModel": "store", "toModule": "store", "fromModel": "stock_location", "fromModule": "stock_location"}	2026-07-04 13:18:03.184746
40	user_user_store_store	{"toModel": "store", "toModule": "store", "fromModel": "user", "fromModule": "user"}	2026-07-04 13:18:03.255481
41	user_user_super_admin_super_admin	{"toModel": "super_admin", "toModule": "super_admin", "fromModel": "user", "fromModule": "user"}	2026-07-04 13:18:03.32025
42	product_product_category_store_store	{"toModel": "store", "toModule": "store", "fromModel": "product_category", "fromModule": "product"}	2026-07-04 13:18:03.386291
43	storeconfigmodule_store_config_store_store	{"toModel": "store", "toModule": "store", "fromModel": "store_config", "fromModule": "storeConfigModuleService"}	2026-07-04 13:18:03.460581
87	product_product_option_store_store	{"toModel": "store", "toModule": "store", "fromModel": "product_option", "fromModule": "product"}	2026-07-20 02:24:03.374805
\.


--
-- Data for Name: location_fulfillment_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_fulfillment_provider (stock_location_id, fulfillment_provider_id, id, created_at, updated_at, deleted_at) FROM stdin;
sloc_01KWPMF6RPFEZRNYVPD3NEDRTB	manual_manual	locfp_01KWPMF6TPEAMVW7585Z41ATTP	2026-07-04 13:18:15.377591+00	2026-07-04 13:18:15.377591+00	\N
sloc_01KX2X6FCT3F7S0B8SNN7PQJDB	manual_manual	locfp_01KX2XMJYR6QTKR5W80TV37XX4	2026-07-09 07:49:22.00751+00	2026-07-09 07:49:22.00751+00	\N
\.


--
-- Data for Name: location_fulfillment_set; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_fulfillment_set (stock_location_id, fulfillment_set_id, id, created_at, updated_at, deleted_at) FROM stdin;
sloc_01KWPMF6RPFEZRNYVPD3NEDRTB	fuset_01KWPMF6VYP7C9E5QDXZN87ZZN	locfs_01KWPMF6XAZ92RN5W78TG30KA7	2026-07-04 13:18:15.46581+00	2026-07-04 13:18:15.46581+00	\N
sloc_01KX2X6FCT3F7S0B8SNN7PQJDB	fuset_01KX2X74HVYACSTBABZ0ZAZMZT	locfs_01KX2X74JMY9SPDSH13Y5KETTZ	2026-07-09 07:42:01.299691+00	2026-07-09 07:42:11.809+00	2026-07-09 07:42:11.808+00
sloc_01KX2X6FCT3F7S0B8SNN7PQJDB	fuset_01KX2X7H94CS9DB34C9C566KGG	locfs_01KX2X7HA1093DJPADTDNXR4MK	2026-07-09 07:42:14.33691+00	2026-07-09 07:42:14.33691+00	\N
sloc_01KX2X6FCT3F7S0B8SNN7PQJDB	fuset_01KX2XVKC7NW7SCMWZEY1D9DDV	locfs_01KX2XVKDEWWZRY32AC8TYD6K9	2026-07-09 07:53:11.853425+00	2026-07-09 07:53:11.853425+00	\N
\.


--
-- Data for Name: mikro_orm_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mikro_orm_migrations (id, name, executed_at) FROM stdin;
1	Migration20260401204521	2026-07-04 13:17:38.592534+00
2	Migration20260405112500	2026-07-04 13:17:38.592534+00
3	Migration20260410191100	2026-07-04 13:17:38.592534+00
4	Migration20260524220933	2026-07-04 13:17:38.592534+00
5	Migration20260524225625	2026-07-04 13:17:38.592534+00
6	Migration20260402183116	2026-07-04 13:17:38.961973+00
7	Migration20260401143914	2026-07-04 13:17:39.223649+00
8	Migration20260405112000	2026-07-04 13:17:39.223649+00
9	Migration20260330190157	2026-07-04 13:17:39.570929+00
10	Migration20260329104245	2026-07-04 13:17:39.935846+00
11	Migration20260329153000	2026-07-04 13:17:39.935846+00
12	Migration20260329185930	2026-07-04 13:17:40.216829+00
13	Migration20260403121004	2026-07-04 13:17:40.541367+00
14	Migration20260403132519	2026-07-04 13:17:40.541367+00
15	Migration20260327143452	2026-07-04 13:17:40.725699+00
16	Migration20260329194835	2026-07-04 13:17:40.725699+00
17	Migration20260428115031	2026-07-04 13:17:41.049066+00
18	Migration20240307161216	2026-07-04 13:17:41.408738+00
19	Migration20241210073813	2026-07-04 13:17:41.408738+00
20	Migration20250106142624	2026-07-04 13:17:41.408738+00
21	Migration20250120110820	2026-07-04 13:17:41.408738+00
22	Migration20240307132720	2026-07-04 13:17:41.775265+00
23	Migration20240719123015	2026-07-04 13:17:41.775265+00
24	Migration20241213063611	2026-07-04 13:17:41.775265+00
25	Migration20251010131115	2026-07-04 13:17:41.775265+00
26	InitialSetup20240401153642	2026-07-04 13:17:42.387287+00
27	Migration20240601111544	2026-07-04 13:17:42.387287+00
28	Migration202408271511	2026-07-04 13:17:42.387287+00
29	Migration20241122120331	2026-07-04 13:17:42.387287+00
30	Migration20241125090957	2026-07-04 13:17:42.387287+00
31	Migration20250411073236	2026-07-04 13:17:42.387287+00
32	Migration20250516081326	2026-07-04 13:17:42.387287+00
33	Migration20250910154539	2026-07-04 13:17:42.387287+00
34	Migration20250911092221	2026-07-04 13:17:42.387287+00
35	Migration20250929204438	2026-07-04 13:17:42.387287+00
36	Migration20251008132218	2026-07-04 13:17:42.387287+00
37	Migration20251011090511	2026-07-04 13:17:42.387287+00
38	Migration20251022153442	2026-07-04 13:17:42.387287+00
39	Migration20251029150809	2026-07-04 13:17:42.387287+00
40	Migration20251110180907	2026-07-04 13:17:42.387287+00
41	Migration20251113183352	2026-07-04 13:17:42.387287+00
42	Migration20260224120000	2026-07-04 13:17:42.387287+00
43	Migration20260301002050	2026-07-04 13:17:42.387287+00
44	Migration20260306120000	2026-07-04 13:17:42.387287+00
45	Migration20230929122253	2026-07-04 13:17:44.804267+00
46	Migration20240322094407	2026-07-04 13:17:44.804267+00
47	Migration20240322113359	2026-07-04 13:17:44.804267+00
48	Migration20240322120125	2026-07-04 13:17:44.804267+00
49	Migration20240626133555	2026-07-04 13:17:44.804267+00
50	Migration20240704094505	2026-07-04 13:17:44.804267+00
51	Migration20241127114534	2026-07-04 13:17:44.804267+00
52	Migration20241127223829	2026-07-04 13:17:44.804267+00
53	Migration20241128055359	2026-07-04 13:17:44.804267+00
54	Migration20241212190401	2026-07-04 13:17:44.804267+00
55	Migration20250408145122	2026-07-04 13:17:44.804267+00
56	Migration20250409122219	2026-07-04 13:17:44.804267+00
57	Migration20251009110625	2026-07-04 13:17:44.804267+00
58	Migration20251112192723	2026-07-04 13:17:44.804267+00
59	Migration20260429163502	2026-07-04 13:17:44.804267+00
60	Migration20240227120221	2026-07-04 13:17:46.052414+00
61	Migration20240617102917	2026-07-04 13:17:46.052414+00
62	Migration20240624153824	2026-07-04 13:17:46.052414+00
63	Migration20241211061114	2026-07-04 13:17:46.052414+00
64	Migration20250113094144	2026-07-04 13:17:46.052414+00
65	Migration20250120110700	2026-07-04 13:17:46.052414+00
66	Migration20250226130616	2026-07-04 13:17:46.052414+00
67	Migration20250508081510	2026-07-04 13:17:46.052414+00
68	Migration20250828075407	2026-07-04 13:17:46.052414+00
69	Migration20250909083125	2026-07-04 13:17:46.052414+00
70	Migration20250916120552	2026-07-04 13:17:46.052414+00
71	Migration20250917143818	2026-07-04 13:17:46.052414+00
72	Migration20250919122137	2026-07-04 13:17:46.052414+00
73	Migration20251006000000	2026-07-04 13:17:46.052414+00
74	Migration20251015113934	2026-07-04 13:17:46.052414+00
75	Migration20251107050148	2026-07-04 13:17:46.052414+00
76	Migration20240124154000	2026-07-04 13:17:47.227831+00
77	Migration20240524123112	2026-07-04 13:17:47.227831+00
78	Migration20240602110946	2026-07-04 13:17:47.227831+00
79	Migration20241211074630	2026-07-04 13:17:47.227831+00
80	Migration20251010130829	2026-07-04 13:17:47.227831+00
81	Migration20240115152146	2026-07-04 13:17:47.685294+00
82	Migration20240222170223	2026-07-04 13:17:47.838655+00
83	Migration20240831125857	2026-07-04 13:17:47.838655+00
84	Migration20241106085918	2026-07-04 13:17:47.838655+00
85	Migration20241205095237	2026-07-04 13:17:47.838655+00
86	Migration20241216183049	2026-07-04 13:17:47.838655+00
87	Migration20241218091938	2026-07-04 13:17:47.838655+00
88	Migration20250120115059	2026-07-04 13:17:47.838655+00
89	Migration20250212131240	2026-07-04 13:17:47.838655+00
90	Migration20250326151602	2026-07-04 13:17:47.838655+00
91	Migration20250508081553	2026-07-04 13:17:47.838655+00
92	Migration20251017153909	2026-07-04 13:17:47.838655+00
93	Migration20251208130704	2026-07-04 13:17:47.838655+00
94	Migration20240205173216	2026-07-04 13:17:48.81005+00
95	Migration20240624200006	2026-07-04 13:17:48.81005+00
96	Migration20250120110744	2026-07-04 13:17:48.81005+00
97	InitialSetup20240221144943	2026-07-04 13:17:49.108828+00
98	Migration20240604080145	2026-07-04 13:17:49.108828+00
99	Migration20241205122700	2026-07-04 13:17:49.108828+00
100	Migration20251015123842	2026-07-04 13:17:49.108828+00
101	InitialSetup20240227075933	2026-07-04 13:17:49.358705+00
102	Migration20240621145944	2026-07-04 13:17:49.358705+00
103	Migration20241206083313	2026-07-04 13:17:49.358705+00
104	Migration20251202184737	2026-07-04 13:17:49.358705+00
105	Migration20251212161429	2026-07-04 13:17:49.358705+00
106	Migration20240227090331	2026-07-04 13:17:49.681358+00
107	Migration20240710135844	2026-07-04 13:17:49.681358+00
108	Migration20240924114005	2026-07-04 13:17:49.681358+00
109	Migration20241212052837	2026-07-04 13:17:49.681358+00
110	InitialSetup20240228133303	2026-07-04 13:17:50.153684+00
111	Migration20240624082354	2026-07-04 13:17:50.153684+00
112	Migration20240225134525	2026-07-04 13:17:50.356764+00
113	Migration20240806072619	2026-07-04 13:17:50.356764+00
114	Migration20241211151053	2026-07-04 13:17:50.356764+00
115	Migration20250115160517	2026-07-04 13:17:50.356764+00
116	Migration20250120110552	2026-07-04 13:17:50.356764+00
117	Migration20250123122334	2026-07-04 13:17:50.356764+00
118	Migration20250206105639	2026-07-04 13:17:50.356764+00
119	Migration20250207132723	2026-07-04 13:17:50.356764+00
120	Migration20250625084134	2026-07-04 13:17:50.356764+00
121	Migration20250924135437	2026-07-04 13:17:50.356764+00
122	Migration20250929124701	2026-07-04 13:17:50.356764+00
123	Migration20240219102530	2026-07-04 13:17:51.209157+00
124	Migration20240604100512	2026-07-04 13:17:51.209157+00
125	Migration20240715102100	2026-07-04 13:17:51.209157+00
126	Migration20240715174100	2026-07-04 13:17:51.209157+00
127	Migration20240716081800	2026-07-04 13:17:51.209157+00
128	Migration20240801085921	2026-07-04 13:17:51.209157+00
129	Migration20240821164505	2026-07-04 13:17:51.209157+00
130	Migration20240821170920	2026-07-04 13:17:51.209157+00
131	Migration20240827133639	2026-07-04 13:17:51.209157+00
132	Migration20240902195921	2026-07-04 13:17:51.209157+00
133	Migration20240913092514	2026-07-04 13:17:51.209157+00
134	Migration20240930122627	2026-07-04 13:17:51.209157+00
135	Migration20241014142943	2026-07-04 13:17:51.209157+00
136	Migration20241106085223	2026-07-04 13:17:51.209157+00
137	Migration20241129124827	2026-07-04 13:17:51.209157+00
138	Migration20241217162224	2026-07-04 13:17:51.209157+00
139	Migration20250326151554	2026-07-04 13:17:51.209157+00
140	Migration20250522181137	2026-07-04 13:17:51.209157+00
141	Migration20250702095353	2026-07-04 13:17:51.209157+00
142	Migration20250704120229	2026-07-04 13:17:51.209157+00
143	Migration20250910130000	2026-07-04 13:17:51.209157+00
144	Migration20251016160403	2026-07-04 13:17:51.209157+00
145	Migration20251016182939	2026-07-04 13:17:51.209157+00
146	Migration20251017155709	2026-07-04 13:17:51.209157+00
147	Migration20251114100559	2026-07-04 13:17:51.209157+00
148	Migration20251125164002	2026-07-04 13:17:51.209157+00
149	Migration20251210112909	2026-07-04 13:17:51.209157+00
150	Migration20251210112924	2026-07-04 13:17:51.209157+00
151	Migration20251225120947	2026-07-04 13:17:51.209157+00
152	Migration20260106185528	2026-07-04 13:17:51.209157+00
153	Migration20250717162007	2026-07-04 13:17:54.166377+00
154	Migration20260127081758	2026-07-04 13:17:54.166377+00
155	Migration20240205025928	2026-07-04 13:17:54.451196+00
156	Migration20240529080336	2026-07-04 13:17:54.451196+00
157	Migration20241202100304	2026-07-04 13:17:54.451196+00
158	Migration20260514083900	2026-07-04 13:17:54.451196+00
159	Migration20260525090000	2026-07-04 13:17:54.451196+00
160	Migration20260604120000	2026-07-04 13:17:54.451196+00
161	Migration20260616075929	2026-07-04 13:17:54.451196+00
162	Migration20240214033943	2026-07-04 13:17:55.450653+00
163	Migration20240703095850	2026-07-04 13:17:55.450653+00
164	Migration20241202103352	2026-07-04 13:17:55.450653+00
165	Migration20240311145700_InitialSetupMigration	2026-07-04 13:17:55.759572+00
166	Migration20240821170957	2026-07-04 13:17:55.759572+00
167	Migration20240917161003	2026-07-04 13:17:55.759572+00
168	Migration20241217110416	2026-07-04 13:17:55.759572+00
169	Migration20250113122235	2026-07-04 13:17:55.759572+00
170	Migration20250120115002	2026-07-04 13:17:55.759572+00
171	Migration20250822130931	2026-07-04 13:17:55.759572+00
172	Migration20250825132614	2026-07-04 13:17:55.759572+00
173	Migration20251114133146	2026-07-04 13:17:55.759572+00
174	Migration20240509083918_InitialSetupMigration	2026-07-04 13:17:56.809128+00
175	Migration20240628075401	2026-07-04 13:17:56.809128+00
176	Migration20240830094712	2026-07-04 13:17:56.809128+00
177	Migration20250120110514	2026-07-04 13:17:56.809128+00
178	Migration20251028172715	2026-07-04 13:17:56.809128+00
179	Migration20251121123942	2026-07-04 13:17:56.809128+00
180	Migration20251121150408	2026-07-04 13:17:56.809128+00
181	Migration20231228143900	2026-07-04 13:17:57.46008+00
182	Migration20241206123341	2026-07-04 13:17:57.46008+00
183	Migration20250120111059	2026-07-04 13:17:57.46008+00
184	Migration20250128174354	2026-07-04 13:17:57.46008+00
185	Migration20250505101505	2026-07-04 13:17:57.46008+00
186	Migration20250819110923	2026-07-04 13:17:57.46008+00
187	Migration20250819110924	2026-07-04 13:17:57.46008+00
188	Migration20250908080326	2026-07-04 13:17:57.46008+00
189	Migration20260619102518	2026-07-04 13:17:58.41233+00
190	Migration20260619140331	2026-07-04 13:17:58.41233+00
191	Migration20260619144609	2026-07-04 13:17:58.41233+00
192	Migration20260620143729	2026-07-04 13:17:58.41233+00
193	Migration20260620161538	2026-07-04 13:17:58.41233+00
194	Migration20260623114617	2026-07-04 13:17:58.41233+00
195	Migration20251013152717	2026-07-20 02:23:56.718712+00
196	Migration20260720160644	2026-07-22 03:02:10.816411+00
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id, "to", channel, template, data, trigger_type, resource_id, resource_type, receiver_id, original_notification_id, idempotency_key, external_id, provider_id, created_at, updated_at, deleted_at, status, "from", provider_data) FROM stdin;
noti_01KZ3TDB15JPD8X1VXJR45T4PA		feed	admin-ui	{"file": {"url": "http://rustfs:3900/medusabucket/1785761016591-product-exports-01KZ3TDARF5JEK259MR4J8CFRW.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=GK74b5173c5cbc8051b2651d2bdeb1a8f9%2F20260803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260803T124336Z&X-Amz-Expires=3600&X-Amz-Signature=377458c8e31ea9110b9b48ccaa1fd2d54a3f3705ca40d6fb3714b9ee79aaf631&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject", "filename": "1785761016591-product-exports.csv", "mimeType": "text/csv"}, "title": "Product export", "description": "Product export completed successfully!"}	\N	\N	\N	\N	\N	\N	\N	local	2026-08-03 12:43:36.873+00	2026-08-03 12:43:36.901+00	\N	success	\N	\N
noti_01KZ8J1WDEXR2RVKQYG7R8160B		feed	admin-ui	{"file": {"url": "http://rustfs:3900/medusabucket/1785920024733-product-exports-01KZ8J1W4YSYVVMVT2K1SBS2PE.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=GK74b5173c5cbc8051b2651d2bdeb1a8f9%2F20260805%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260805T085344Z&X-Amz-Expires=3600&X-Amz-Signature=5ff288c720bc67de55e3daf54efa3c0f682fb2fe702cc670e8e8f9e7ef8ef67d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject", "filename": "1785920024733-product-exports.csv", "mimeType": "text/csv"}, "title": "Product export", "description": "Product export completed successfully!"}	\N	\N	\N	\N	\N	\N	\N	local	2026-08-05 08:53:45.008+00	2026-08-05 08:53:45.031+00	\N	success	\N	\N
\.


--
-- Data for Name: notification_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_provider (id, handle, name, is_enabled, channels, created_at, updated_at, deleted_at) FROM stdin;
local	local	local	t	{feed}	2026-07-04 13:18:12.664+00	2026-07-04 13:18:12.664+00	\N
\.


--
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."order" (id, region_id, display_id, customer_id, version, sales_channel_id, status, is_draft_order, email, currency_code, shipping_address_id, billing_address_id, no_notification, metadata, created_at, updated_at, deleted_at, canceled_at, custom_display_id, locale) FROM stdin;
\.


--
-- Data for Name: order_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_address (id, customer_id, company, first_name, last_name, address_1, address_2, city, country_code, province, postal_code, phone, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_cart (order_id, cart_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_change; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_change (id, order_id, version, description, status, internal_note, created_by, requested_by, requested_at, confirmed_by, confirmed_at, declined_by, declined_reason, metadata, declined_at, canceled_by, canceled_at, created_at, updated_at, change_type, deleted_at, return_id, claim_id, exchange_id, carry_over_promotions) FROM stdin;
\.


--
-- Data for Name: order_change_action; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_change_action (id, order_id, version, ordering, order_change_id, reference, reference_id, action, details, amount, raw_amount, internal_note, applied, created_at, updated_at, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
\.


--
-- Data for Name: order_claim; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_claim (id, order_id, return_id, order_version, display_id, type, no_notification, refund_amount, raw_refund_amount, metadata, created_at, updated_at, deleted_at, canceled_at, created_by) FROM stdin;
\.


--
-- Data for Name: order_claim_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_claim_item (id, claim_id, item_id, is_additional_item, reason, quantity, raw_quantity, note, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_claim_item_image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_claim_item_image (id, claim_item_id, url, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_credit_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_credit_line (id, order_id, reference, reference_id, amount, raw_amount, metadata, created_at, updated_at, deleted_at, version) FROM stdin;
\.


--
-- Data for Name: order_exchange; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_exchange (id, order_id, return_id, order_version, display_id, no_notification, allow_backorder, difference_due, raw_difference_due, metadata, created_at, updated_at, deleted_at, canceled_at, created_by) FROM stdin;
\.


--
-- Data for Name: order_exchange_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_exchange_item (id, exchange_id, item_id, quantity, raw_quantity, note, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_fulfillment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_fulfillment (order_id, fulfillment_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_item (id, order_id, version, item_id, quantity, raw_quantity, fulfilled_quantity, raw_fulfilled_quantity, shipped_quantity, raw_shipped_quantity, return_requested_quantity, raw_return_requested_quantity, return_received_quantity, raw_return_received_quantity, return_dismissed_quantity, raw_return_dismissed_quantity, written_off_quantity, raw_written_off_quantity, metadata, created_at, updated_at, deleted_at, delivered_quantity, raw_delivered_quantity, unit_price, raw_unit_price, compare_at_unit_price, raw_compare_at_unit_price) FROM stdin;
\.


--
-- Data for Name: order_line_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_line_item (id, totals_id, title, subtitle, thumbnail, variant_id, product_id, product_title, product_description, product_subtitle, product_type, product_collection, product_handle, variant_sku, variant_barcode, variant_title, variant_option_values, requires_shipping, is_discountable, is_tax_inclusive, compare_at_unit_price, raw_compare_at_unit_price, unit_price, raw_unit_price, metadata, created_at, updated_at, deleted_at, is_custom_price, product_type_id, is_giftcard) FROM stdin;
\.


--
-- Data for Name: order_line_item_adjustment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_line_item_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, created_at, updated_at, item_id, deleted_at, is_tax_inclusive, version) FROM stdin;
\.


--
-- Data for Name: order_line_item_tax_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_line_item_tax_line (id, description, tax_rate_id, code, rate, raw_rate, provider_id, created_at, updated_at, item_id, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_order_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_order_store_store (order_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_payment_collection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_payment_collection (order_id, payment_collection_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_promotion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_promotion (order_id, promotion_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_shipping; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_shipping (id, order_id, version, shipping_method_id, created_at, updated_at, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
\.


--
-- Data for Name: order_shipping_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_shipping_method (id, name, description, amount, raw_amount, is_tax_inclusive, shipping_option_id, data, metadata, created_at, updated_at, deleted_at, is_custom_amount) FROM stdin;
\.


--
-- Data for Name: order_shipping_method_adjustment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_shipping_method_adjustment (id, description, promotion_id, code, amount, raw_amount, provider_id, created_at, updated_at, shipping_method_id, deleted_at, version) FROM stdin;
\.


--
-- Data for Name: order_shipping_method_tax_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_shipping_method_tax_line (id, description, tax_rate_id, code, rate, raw_rate, provider_id, created_at, updated_at, shipping_method_id, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_summary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_summary (id, order_id, version, totals, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: order_transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_transaction (id, order_id, version, amount, raw_amount, currency_code, reference, reference_id, created_at, updated_at, deleted_at, return_id, claim_id, exchange_id) FROM stdin;
\.


--
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment (id, amount, raw_amount, currency_code, provider_id, data, created_at, updated_at, deleted_at, captured_at, canceled_at, payment_collection_id, payment_session_id, metadata) FROM stdin;
\.


--
-- Data for Name: payment_collection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_collection (id, currency_code, amount, raw_amount, authorized_amount, raw_authorized_amount, captured_amount, raw_captured_amount, refunded_amount, raw_refunded_amount, created_at, updated_at, deleted_at, completed_at, status, metadata) FROM stdin;
\.


--
-- Data for Name: payment_collection_payment_providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_collection_payment_providers (payment_collection_id, payment_provider_id) FROM stdin;
\.


--
-- Data for Name: payment_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_provider (id, is_enabled, created_at, updated_at, deleted_at) FROM stdin;
pp_behpardakht_behpardakht	t	2026-07-04 13:18:12.645+00	2026-07-04 13:18:12.645+00	\N
pp_system_default	t	2026-07-04 13:18:12.646+00	2026-07-04 13:18:12.646+00	\N
\.


--
-- Data for Name: payment_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_session (id, currency_code, amount, raw_amount, provider_id, data, context, status, authorized_at, payment_collection_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: plan_offer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plan_offer (id, name, scope, product_id, variant_id, is_enabled, allowed_frequencies, frequency_intervals, discount_per_frequency, rules, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: price; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price (id, title, price_set_id, currency_code, raw_amount, rules_count, created_at, updated_at, deleted_at, price_list_id, amount, min_quantity, max_quantity, raw_min_quantity, raw_max_quantity) FROM stdin;
price_01KWPMF735C5Y5RHX5T2QZ0V1Q	\N	pset_01KWPMF7398XRAA35GF4MEDD4Q	irr	{"value": "1000000", "precision": 20}	0	2026-07-04 13:18:15.661+00	2026-07-04 13:18:15.661+00	\N	\N	1000000	\N	\N	\N	\N
price_01KWPMF738VHD4DJYGX9YNAHSC	\N	pset_01KWPMF7398XRAA35GF4MEDD4Q	irr	{"value": "1000000", "precision": 20}	1	2026-07-04 13:18:15.661+00	2026-07-04 13:18:15.661+00	\N	\N	1000000	\N	\N	\N	\N
price_01KWPMF739DF2AJMQJFZVP4AKT	\N	pset_01KWPMF73B6RYQERHDSM6X5AN2	irr	{"value": "1500000", "precision": 20}	0	2026-07-04 13:18:15.662+00	2026-07-04 13:18:15.662+00	\N	\N	1500000	\N	\N	\N	\N
price_01KWPMF73AF1RJ9MHK5X2YHXZH	\N	pset_01KWPMF73B6RYQERHDSM6X5AN2	irr	{"value": "1500000", "precision": 20}	1	2026-07-04 13:18:15.662+00	2026-07-04 13:18:15.662+00	\N	\N	1500000	\N	\N	\N	\N
price_01KX2XX8GY73EA6P4DT2FH079D	\N	pset_01KX2XX8H1DBDF260PJG6BE6CV	irr	{"value": "0", "precision": 20}	0	2026-07-09 07:54:06.243+00	2026-07-09 07:54:06.243+00	\N	\N	0	\N	\N	\N	\N
price_01KX2XX8H1FS4EMHAH1BVGEVXX	\N	pset_01KX2XX8H1DBDF260PJG6BE6CV	irr	{"value": "0", "precision": 20}	1	2026-07-09 07:54:06.244+00	2026-07-09 07:54:06.244+00	\N	\N	0	\N	\N	\N	\N
price_01KX2Y6V0368JF6H6A0PTXA8SK	\N	pset_01KX2Y6V059RK921J65KQ5BWWZ	irr	{"value": "0", "precision": 20}	0	2026-07-09 07:59:20.069+00	2026-07-09 07:59:20.069+00	\N	\N	0	\N	\N	\N	\N
price_01KX2Y6V04S5N99JJ7NYM7CD1H	\N	pset_01KX2Y6V059RK921J65KQ5BWWZ	irr	{"value": "0", "precision": 20}	1	2026-07-09 07:59:20.07+00	2026-07-09 07:59:20.07+00	\N	\N	0	\N	\N	\N	\N
price_01KX1NARDWJ1YWWPYSZ9XX5QGH	\N	pset_01KX1NARDXCR09DPD3J3JS5F14	irr	{"value": "300000", "precision": 20}	0	2026-07-08 20:04:56.897+00	2026-07-22 03:03:41.735+00	2026-07-22 03:03:41.709+00	\N	300000	\N	\N	\N	\N
price_01KX1NARDYG9F51DD0JWZ024JK	\N	pset_01KX1NARDYY1Q8KA3JRN5XT14R	irr	{"value": "300000", "precision": 20}	0	2026-07-08 20:04:56.898+00	2026-07-22 03:03:41.763+00	2026-07-22 03:03:41.709+00	\N	300000	\N	\N	\N	\N
price_01KX1NARDZ7EJJQ2DHJF1Z5VWP	\N	pset_01KX1NARDZ3MDAF7J0SKR7JJQQ	irr	{"value": "300000", "precision": 20}	0	2026-07-08 20:04:56.898+00	2026-07-22 03:03:41.785+00	2026-07-22 03:03:41.709+00	\N	300000	\N	\N	\N	\N
\.


--
-- Data for Name: price_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_list (id, status, starts_at, ends_at, rules_count, title, description, type, created_at, updated_at, deleted_at, metadata) FROM stdin;
\.


--
-- Data for Name: price_list_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_list_rule (id, price_list_id, created_at, updated_at, deleted_at, value, attribute) FROM stdin;
\.


--
-- Data for Name: price_preference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_preference (id, attribute, value, is_tax_inclusive, created_at, updated_at, deleted_at) FROM stdin;
prpref_01KWPMF6NMJV7M8A0NJ9FKBTX4	region_id	reg_01KWPMF6JRM4THSDMV3YPVPFQB	f	2026-07-04 13:18:15.22+00	2026-07-04 13:18:15.22+00	\N
prpref_01KWQ6ZRAXZ8K4F7AA5TF81QKG	currency_code	usd	f	2026-07-04 18:41:51.966+00	2026-07-04 18:41:51.966+00	\N
prpref_01KWPMF6HF64M319MKTWFEDHBK	currency_code	irr	f	2026-07-04 13:18:15.087+00	2026-07-08 19:57:06.033+00	\N
\.


--
-- Data for Name: price_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_rule (id, value, priority, price_id, created_at, updated_at, deleted_at, attribute, operator) FROM stdin;
prule_01KWPMF738BXZGN7FXT3A22QJ5	reg_01KWPMF6JRM4THSDMV3YPVPFQB	0	price_01KWPMF738VHD4DJYGX9YNAHSC	2026-07-04 13:18:15.662+00	2026-07-04 13:18:15.662+00	\N	region_id	eq
prule_01KWPMF73APFKKJ9JF9F1MDAPV	reg_01KWPMF6JRM4THSDMV3YPVPFQB	0	price_01KWPMF73AF1RJ9MHK5X2YHXZH	2026-07-04 13:18:15.662+00	2026-07-04 13:18:15.662+00	\N	region_id	eq
prule_01KX2XX8H0GF93X76MN16X6BM9	reg_01KWPMF6JRM4THSDMV3YPVPFQB	0	price_01KX2XX8H1FS4EMHAH1BVGEVXX	2026-07-09 07:54:06.244+00	2026-07-09 07:54:06.244+00	\N	region_id	eq
prule_01KX2Y6V045SW59T3GA8FVWFRT	reg_01KWPMF6JRM4THSDMV3YPVPFQB	0	price_01KX2Y6V04S5N99JJ7NYM7CD1H	2026-07-09 07:59:20.07+00	2026-07-09 07:59:20.07+00	\N	region_id	eq
\.


--
-- Data for Name: price_set; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_set (id, created_at, updated_at, deleted_at) FROM stdin;
pset_01KWPMF7398XRAA35GF4MEDD4Q	2026-07-04 13:18:15.66+00	2026-07-04 13:18:15.66+00	\N
pset_01KWPMF73B6RYQERHDSM6X5AN2	2026-07-04 13:18:15.66+00	2026-07-04 13:18:15.66+00	\N
pset_01KX2XX8H1DBDF260PJG6BE6CV	2026-07-09 07:54:06.242+00	2026-07-09 07:54:06.242+00	\N
pset_01KX2Y6V059RK921J65KQ5BWWZ	2026-07-09 07:59:20.069+00	2026-07-09 07:59:20.069+00	\N
pset_01KX1NARDXCR09DPD3J3JS5F14	2026-07-08 20:04:56.896+00	2026-07-22 03:03:41.711+00	2026-07-22 03:03:41.709+00
pset_01KX1NARDYY1Q8KA3JRN5XT14R	2026-07-08 20:04:56.897+00	2026-07-22 03:03:41.75+00	2026-07-22 03:03:41.709+00
pset_01KX1NARDZ3MDAF7J0SKR7JJQQ	2026-07-08 20:04:56.897+00	2026-07-22 03:03:41.775+00	2026-07-22 03:03:41.709+00
pset_01KY3WF69RHWQC14DH61BSZZ1A	2026-07-22 03:03:52.889+00	2026-08-03 12:32:02.802+00	2026-08-03 12:32:02.802+00
pset_01KZ3SYX8PV26HHKC8EMQ4VG2W	2026-08-03 12:35:44.023+00	2026-08-03 12:35:44.023+00	\N
pset_01KZ3TGX16F6W920YAAV1NTSA4	2026-08-03 12:45:33.607+00	2026-08-03 12:45:33.607+00	\N
pset_01KZ3TM3ZZ0QGBCFDPX4GC7T7W	2026-08-03 12:47:19.039+00	2026-08-03 12:50:42.625+00	2026-08-03 12:50:42.624+00
pset_01KZ3TWFN0466M824RX4FKZ0HA	2026-08-03 12:51:53.121+00	2026-08-03 12:51:53.121+00	\N
pset_01KZ3TZ1G9SYAKFDNXCFNW75MB	2026-08-03 12:53:16.937+00	2026-08-03 12:53:16.937+00	\N
pset_01KZ5TBB2EZXA6ETDH94VR2F66	2026-08-04 07:21:00.239+00	2026-08-04 07:21:00.239+00	\N
pset_01KZ5TFPN7WKCT6XNC2N01E2FP	2026-08-04 07:23:23.176+00	2026-08-04 07:23:23.176+00	\N
pset_01KZ5TH72EZ448QCMFN1VG9YRE	2026-08-04 07:24:12.751+00	2026-08-04 07:24:12.751+00	\N
pset_01KZ5TNNTKKJNGVWHST5TZKB47	2026-08-04 07:26:38.932+00	2026-08-04 07:26:38.932+00	\N
pset_01KZ5TR9VEKWBXEWZ17CKV1FQW	2026-08-04 07:28:04.975+00	2026-08-04 07:28:04.975+00	\N
pset_01KZ5TTMTPME4RMP0GXVBP5BRY	2026-08-04 07:29:21.75+00	2026-08-04 07:29:21.75+00	\N
pset_01KZ5TXDJBKNKTFAPS2QWKWPHZ	2026-08-04 07:30:52.619+00	2026-08-04 07:30:52.619+00	\N
pset_01KZ5TYYSEY2NY8T8Z9MPJPWDX	2026-08-04 07:31:43.023+00	2026-08-04 07:31:43.023+00	\N
\.


--
-- Data for Name: pricing_price_list_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pricing_price_list_store_store (price_list_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (id, title, handle, subtitle, description, is_giftcard, status, thumbnail, weight, length, height, width, origin_country, hs_code, mid_code, material, collection_id, type_id, discountable, external_id, created_at, updated_at, deleted_at, metadata) FROM stdin;
prod_01KX1MP5GT70AMXB3ZR3ZWDJ2W	تابش الکتریک	store-01kx1mp5cvct65e2j2c934n6v9	\N	\N	f	published	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-07-08 19:53:42.188+00	2026-07-08 20:02:43.247+00	2026-07-08 20:02:43.245+00	\N
prod_01KWQ6ZRCPM82HMP1WC888MMTW	SUPER ADMIN STORE	ncp-9317-store-01kwq6zr936j01m44q7dxt1ft5	\N	\N	f	published	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-07-04 18:41:52.033+00	2026-07-22 03:01:21.029+00	\N	\N
prod_01KX1NAR4D4B7NCRM6S4R1HATV	لامپ	ncp-6373-لامپ	\N	\N	f	published	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-07-08 20:04:56.601+00	2026-07-22 03:03:41.547+00	2026-07-22 03:03:41.544+00	\N
prod_01KY3WF61A8ZS82SW750VEF3YS	لامپ	ncp-3617-لامپ			f	published	\N	\N	\N	\N	\N	\N	\N	\N	\N	pcol_01KY3WE0X6BXFSZQE4DMPAST1G	\N	t	\N	2026-07-22 03:03:52.631+00	2026-08-03 12:32:02.733+00	2026-08-03 12:32:02.732+00	\N
prod_01KZ5TNNK4J4CFBE09JCFE728E	فنر سیم کشی 6 متری فلزی درجه 1	ncp-3549-tools			f	published	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ5TNNF87EHKDC4DQXQ44FHF.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-08-04 07:26:38.696+00	2026-08-04 07:26:39.164+00	\N	\N
prod_01KZ3TM3TF40YQW5F6FEDZCNB3	فنر سیم کشی 15 متری	ncp-9498-tools	فلزی		f	published	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-08-03 12:47:18.867+00	2026-08-03 12:50:42.56+00	2026-08-03 12:50:42.559+00	\N
prod_01KZ5TBAT4SKW78XCV56FM5JRD	فنر سیم کشی 10 متری پلاستیکی	ncp-1585-tools			f	published	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__145-01KZ5TBANNP9WSX96JVH2D7A3M.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-08-04 07:20:59.985+00	2026-08-04 07:21:00.473+00	\N	\N
prod_01KZ3SYWZB87P57Z1PD0T5RH7Z	فنر سیم کشی 6 متری فلزی	ncp-8741-tools	\N	\N	f	published	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ3SYWSGBD4C4Y6TDDN0JWAZ.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	2026-08-03 12:35:43.738+00	2026-08-04 07:21:48.732+00	\N	\N
prod_01KZ3TGWQD1T8ZD99PE1T4R138	فنر سیم کشی 10 متری فلزی	ncp-2465-tools	\N	\N	f	published	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ3TGWKMWMAJ0MSDSGXXTCY0.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-08-03 12:45:33.297+00	2026-08-04 07:22:01.482+00	\N	\N
prod_01KZ3TWFAVPDMVXWAEZYFBZJ5P	فنر سیم کشی 15 متری فلزی	ncp-6689-tools	\N	\N	f	published	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ3TWF5YBE9NYRAKM5FWASY7.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-08-03 12:51:52.8+00	2026-08-04 07:22:16.821+00	\N	\N
prod_01KZ3TZ12N3Y3HAW8DENA6M1QQ	فنر سیم کشی 20 متری فلزی	ncp-3387-tools	\N	\N	f	published	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ3TZ0XJYS5H8C515XD5XZMC.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-08-03 12:53:16.511+00	2026-08-04 07:22:31.273+00	\N	\N
prod_01KZ5TFPDWS8KJAK5MSEN8GHH4	فنر سیم کشی 15 متری پلاستیکی	ncp-2148-tools			f	published	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__145-01KZ5TFPA17251F50G097EFH4F.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-08-04 07:23:22.944+00	2026-08-04 07:23:23.423+00	\N	\N
prod_01KZ5TH6TB2WG4D4P03SKRCG4M	فنر سیم کشی 20 متری پلاستیکی	ncp-9315-tools			f	published	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__145-01KZ5TH6PWZW7XQ1YRR7JATX35.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-08-04 07:24:12.498+00	2026-08-04 07:24:13.015+00	\N	\N
prod_01KZ5TR9KKNDKZ1809RX9ECMXC	فنر سیم کشی 10 متری فلزی درجه 1	ncp-9258-tools			f	published	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ5TR9G86YCAQ1YZ7PY5WBQP.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-08-04 07:28:04.726+00	2026-08-04 07:28:05.462+00	\N	\N
prod_01KZ5TTMM17296PHA0QDNHEHKY	فنر سیم کشی 15 متری فلزی درجه 1	ncp-5849-tools			f	published	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ5TTMFKX3PEFGNFZ34E37ZP.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-08-04 07:29:21.542+00	2026-08-04 07:29:21.977+00	\N	\N
prod_01KZ5TXDB07KDZ89FJ0MTRYAKJ	فنر سیم کشی 20 متری فلزی درجه 1	ncp-6711-tools			f	published	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ5TXD7DXRK0ABZDR6DZRYGQ.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-08-04 07:30:52.388+00	2026-08-04 07:30:52.84+00	\N	\N
prod_01KZ5TYYJWMGQ76KH4EN1ZK14R	فنر سیم کشی 25 متری فلزی درجه 1	ncp-8589-tools			f	published	/upload/store_01KX1MP5CVCT65E2J2C934N6V9__tbselec211-01KZ5TYYF86KWFZ19HJ1SZKFWB.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2026-08-04 07:31:42.818+00	2026-08-04 07:31:43.228+00	\N	\N
\.


--
-- Data for Name: product_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_category (id, name, description, handle, mpath, is_active, is_internal, rank, parent_category_id, created_at, updated_at, deleted_at, metadata, external_id) FROM stdin;
pcat_01KZ3RNC4WW739HD3PYZBA7BY3	ابزار آلات		ncc-1615-tools	pcat_01KZ3RNC4WW739HD3PYZBA7BY3	t	f	1	\N	2026-08-03 12:13:03.005+00	2026-08-06 13:28:36.503+00	\N	\N	\N
pcat_01KXYNEQMDS86H6FHSW8E3NRK9	روشنایی		روشنایی-1784514305762	pcat_01KXYNEQMDS86H6FHSW8E3NRK9	t	f	4	\N	2026-07-20 02:25:05.678+00	2026-07-22 03:04:09.489+00	2026-07-22 03:04:09.488+00	\N	\N
pcat_01KZ3RP9A47GNB26FRFK1GSQQB	روشنایی		ncc-1690-lighting	pcat_01KZ3RP9A47GNB26FRFK1GSQQB	t	f	2	\N	2026-08-03 12:13:32.869+00	2026-08-06 13:28:36.503+00	\N	\N	\N
pcat_01KZ3S5MZPGC4Q0PKJXZ77AP50	تجهیزات برق صنعتی		ncc-3292-Electrical_equipment		t	f	0	\N	2026-08-03 12:21:56.342+00	2026-08-06 13:28:36.503+00	\N	\N	\N
pcat_01KY3WFXSEM6Y44V3W4WGDMTEH	روشنایی		ncc-9292-روشنایی	pcat_01KY3WFXSEM6Y44V3W4WGDMTEH	t	f	4	\N	2026-07-22 03:04:16.943+00	2026-08-03 12:11:33.357+00	2026-08-03 12:11:33.356+00	\N	\N
pcat_01KWPMF7B5DX84DH6RVNCG8GAT	تی‌شرت		تی‌شرت-1783171096062	pcat_01KWPMF7B5DX84DH6RVNCG8GAT	t	f	3	\N	2026-07-04 13:18:15.915+00	2026-08-06 13:28:36.503+00	\N	\N	\N
pcat_01KZ3SMS29GYY3312V16KS14SB	متفرقه		ncc-9671-Misc	pcat_01KZ3SMS29GYY3312V16KS14SB	t	f	8	\N	2026-08-03 12:30:12.042+00	2026-08-06 13:28:36.503+00	\N	\N	\N
pcat_01KWPMF7B774D45Y04J9AHDG6W	سویشرت‌		سویشرت‌-1783171096110	pcat_01KWPMF7B774D45Y04J9AHDG6W	t	f	5	\N	2026-07-04 13:18:15.916+00	2026-08-06 13:28:36.503+00	\N	\N	\N
pcat_01KZ3S23JXHGXAK1G20TXT0PP6	حفاظتی و کنترل		ncc-2664-protection	pcat_01KZ3S23JXHGXAK1G20TXT0PP6	t	f	0	\N	2026-08-03 12:20:00.224+00	2026-08-06 13:28:36.509+00	2026-08-06 13:28:36.508+00	\N	\N
pcat_01KZ3RR9ZDDEFAJ42ZSM3QTF92	سنسور و حسگرها		ncc-6738-Sensors	pcat_01KZ3RR9ZDDEFAJ42ZSM3QTF92	t	f	3	\N	2026-08-03 12:14:39.086+00	2026-08-06 13:26:35.11+00	2026-08-06 13:26:35.11+00	\N	\N
pcat_01KZ3SCAW5ZJYXCMN6DGD3C5SJ	ترمینال ، شمش و مقره		ncc-8203-Electrical_terminal		t	f	3	\N	2026-08-03 12:25:35.367+00	2026-08-06 13:26:54.93+00	2026-08-06 13:26:54.927+00	\N	\N
pcat_01KZ3SFW8PTV186YJDWJF3SPYX	دوشاخه ، سه راهی و محافظ برق		ncc-4466-Power_plug	pcat_01KZ3SFW8PTV186YJDWJF3SPYX	t	f	5	\N	2026-08-03 12:27:31.479+00	2026-08-06 13:27:00.392+00	2026-08-06 13:27:00.392+00	\N	\N
pcat_01KZ3RWHFYJ8AHMNM2HJDZ8AJ2	کلید و شستی های صنعتی		ncc-8541-switch	pcat_01KZ3RWHFYJ8AHMNM2HJDZ8AJ2	t	f	3	\N	2026-08-03 12:16:57.855+00	2026-08-06 13:26:41.867+00	2026-08-06 13:26:41.867+00	\N	\N
pcat_01KZ3RY4BBWVB2QZ2WNJJRNV7D	سرسیم و کابلشو		ncc-5538-Kabul	pcat_01KZ3RY4BBWVB2QZ2WNJJRNV7D	t	f	3	\N	2026-08-03 12:17:49.932+00	2026-08-06 13:26:46.153+00	2026-08-06 13:26:46.152+00	\N	\N
pcat_01KZ3S96ZVF592SGEVT2QGD098	چسب و آپارات		ncc-2350-glue	pcat_01KZ3S96ZVF592SGEVT2QGD098	t	f	8	\N	2026-08-03 12:23:53.084+00	2026-08-06 13:26:30.457+00	2026-08-06 13:26:30.456+00	\N	\N
pcat_01KZ3SGWH5AA8NRX9TYP358EXE	ساختمانی		ncc-8296-construction	pcat_01KZ3SGWH5AA8NRX9TYP358EXE	t	f	4	\N	2026-08-03 12:28:04.517+00	2026-08-06 13:28:36.504+00	\N	\N	\N
pcat_01KWPMF7B93EVDYAM4CGPP0C6X	شلوار		شلوار-1783171096132	pcat_01KWPMF7B93EVDYAM4CGPP0C6X	t	f	6	\N	2026-07-04 13:18:15.916+00	2026-08-06 13:28:36.504+00	\N	\N	\N
pcat_01KWPMF7BAWGCKWAZN22GWX15P	محصولات جانبی		محصولات-جانبی-1783171096151	pcat_01KWPMF7BAWGCKWAZN22GWX15P	t	f	7	\N	2026-07-04 13:18:15.916+00	2026-08-06 13:28:36.504+00	\N	\N	\N
\.


--
-- Data for Name: product_category_image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_category_image (id, url, file_id, type, category_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: product_category_product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_category_product (product_id, product_category_id) FROM stdin;
prod_01KZ3SYWZB87P57Z1PD0T5RH7Z	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
prod_01KZ3TGWQD1T8ZD99PE1T4R138	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
prod_01KZ3TM3TF40YQW5F6FEDZCNB3	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
prod_01KZ3TWFAVPDMVXWAEZYFBZJ5P	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
prod_01KZ3TZ12N3Y3HAW8DENA6M1QQ	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
prod_01KZ5TBAT4SKW78XCV56FM5JRD	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
prod_01KZ5TFPDWS8KJAK5MSEN8GHH4	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
prod_01KZ5TH6TB2WG4D4P03SKRCG4M	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
prod_01KZ5TNNK4J4CFBE09JCFE728E	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
prod_01KZ5TR9KKNDKZ1809RX9ECMXC	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
prod_01KZ5TTMM17296PHA0QDNHEHKY	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
prod_01KZ5TXDB07KDZ89FJ0MTRYAKJ	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
prod_01KZ5TYYJWMGQ76KH4EN1ZK14R	pcat_01KZ3RNC4WW739HD3PYZBA7BY3
\.


--
-- Data for Name: product_collection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_collection (id, title, handle, metadata, created_at, updated_at, deleted_at, external_id) FROM stdin;
pcol_01KY3WE0X6BXFSZQE4DMPAST1G	فروش ویژه	ncp-6429-فروش-ویژه	\N	2026-07-22 03:03:14.592362+00	2026-07-22 03:03:14.747+00	\N	\N
\.


--
-- Data for Name: product_option; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_option (id, title, metadata, created_at, updated_at, deleted_at, is_exclusive) FROM stdin;
opt_01KWQ6ZRCQQN0QKAKBEG2JG9FZ	Default option	\N	2026-07-04 18:41:52.034+00	2026-07-04 18:41:52.034+00	\N	t
opt_01KX1MP5GVE06XKCAPN1AANZV3	Default option	\N	2026-07-08 19:53:42.189+00	2026-07-08 20:02:43.332+00	2026-07-08 20:02:43.33+00	t
opt_01KX1NAR4DGNT6Y3G9Z571RDRZ	توان	\N	2026-07-08 20:04:56.601+00	2026-07-22 03:03:41.859+00	2026-07-22 03:03:41.858+00	t
opt_01KY3WF61B6PQSCBSXS624QFS6	Default option	\N	2026-07-22 03:03:52.632+00	2026-08-03 12:32:02.88+00	2026-08-03 12:32:02.879+00	t
opt_01KZ3SYWZCEH8B931HVTTN6RJ3	Default option	\N	2026-08-03 12:35:43.738+00	2026-08-03 12:35:43.738+00	\N	t
opt_01KZ3TGWQD6XBC46B9664XYQGM	Default option	\N	2026-08-03 12:45:33.297+00	2026-08-03 12:45:33.297+00	\N	t
opt_01KZ3TM3TFN8FBZR15XXY7MB2T	Default option	\N	2026-08-03 12:47:18.867+00	2026-08-03 12:50:42.694+00	2026-08-03 12:50:42.692+00	t
opt_01KZ3TWFAVXRTFZA47F9YBZ9SC	Default option	\N	2026-08-03 12:51:52.8+00	2026-08-03 12:51:52.8+00	\N	t
opt_01KZ3TZ12N7Q12FMYNMY4HD83Z	Default option	\N	2026-08-03 12:53:16.511+00	2026-08-03 12:53:16.511+00	\N	t
opt_01KZ5TBAT5ECGSY97CFN7JMWR1	Default option	\N	2026-08-04 07:20:59.986+00	2026-08-04 07:20:59.986+00	\N	t
opt_01KZ5TFPDX2S2SXYHQF0A8BZ47	Default option	\N	2026-08-04 07:23:22.945+00	2026-08-04 07:23:22.945+00	\N	t
opt_01KZ5TH6TBG79CQ77AEHZ6JV9V	Default option	\N	2026-08-04 07:24:12.499+00	2026-08-04 07:24:12.499+00	\N	t
opt_01KZ5TNNK552S6QR5M76385W5J	Default option	\N	2026-08-04 07:26:38.697+00	2026-08-04 07:26:38.697+00	\N	t
opt_01KZ5TR9KK635GGGFVCDG270W0	Default option	\N	2026-08-04 07:28:04.727+00	2026-08-04 07:28:04.727+00	\N	t
opt_01KZ5TTMM22NNDXJWRGTSB3A9M	Default option	\N	2026-08-04 07:29:21.542+00	2026-08-04 07:29:21.542+00	\N	t
opt_01KZ5TXDB0YSJARAG7F2EGNW0A	Default option	\N	2026-08-04 07:30:52.388+00	2026-08-04 07:30:52.388+00	\N	t
opt_01KZ5TYYJWYMBSDDEXQ836GM4V	Default option	\N	2026-08-04 07:31:42.818+00	2026-08-04 07:31:42.818+00	\N	t
\.


--
-- Data for Name: product_option_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_option_value (id, value, option_id, metadata, created_at, updated_at, deleted_at, rank) FROM stdin;
optval_01KWQ6ZRCZKAWTJPM21ZBQH5KW	Default option value	opt_01KWQ6ZRCQQN0QKAKBEG2JG9FZ	\N	2026-07-04 18:41:52.035+00	2026-07-04 18:41:52.035+00	\N	\N
optval_01KX1MP5HBNGRFNWTEJAV6PXES	Default option value	opt_01KX1MP5GVE06XKCAPN1AANZV3	\N	2026-07-08 19:53:42.19+00	2026-07-08 20:02:43.357+00	2026-07-08 20:02:43.33+00	\N
optval_01KX1NAR4NTF3729PPWDBAR37A	100	opt_01KX1NAR4DGNT6Y3G9Z571RDRZ	\N	2026-07-08 20:04:56.602+00	2026-07-22 03:03:41.875+00	2026-07-22 03:03:41.858+00	\N
optval_01KX1NAR4PEEXDGK5HAE4NW6GW	200	opt_01KX1NAR4DGNT6Y3G9Z571RDRZ	\N	2026-07-08 20:04:56.602+00	2026-07-22 03:03:41.876+00	2026-07-22 03:03:41.858+00	\N
optval_01KX1NAR4PQM8EGERDC95KMCKM	300	opt_01KX1NAR4DGNT6Y3G9Z571RDRZ	\N	2026-07-08 20:04:56.602+00	2026-07-22 03:03:41.876+00	2026-07-22 03:03:41.858+00	\N
optval_01KY3WF61MWXMQ9E04A7VVGHBM	Default option value	opt_01KY3WF61B6PQSCBSXS624QFS6	\N	2026-07-22 03:03:52.632+00	2026-08-03 12:32:02.897+00	2026-08-03 12:32:02.879+00	\N
optval_01KZ3SYWZRWXXEDWMCNX671W13	Default option value	opt_01KZ3SYWZCEH8B931HVTTN6RJ3	\N	2026-08-03 12:35:43.739+00	2026-08-03 12:35:43.739+00	\N	\N
optval_01KZ3TGWQGZ0377JQTE2BBBK7P	Default option value	opt_01KZ3TGWQD6XBC46B9664XYQGM	\N	2026-08-03 12:45:33.297+00	2026-08-03 12:45:33.297+00	\N	\N
optval_01KZ3TM3TJBPP7S6D0JR7ANTPR	Default option value	opt_01KZ3TM3TFN8FBZR15XXY7MB2T	\N	2026-08-03 12:47:18.867+00	2026-08-03 12:50:42.713+00	2026-08-03 12:50:42.692+00	\N
optval_01KZ3TWFAY61QMVJYR9C677N3Y	Default option value	opt_01KZ3TWFAVXRTFZA47F9YBZ9SC	\N	2026-08-03 12:51:52.801+00	2026-08-03 12:51:52.801+00	\N	\N
optval_01KZ3TZ12XAFR5NQXR6P14B08E	Default option value	opt_01KZ3TZ12N7Q12FMYNMY4HD83Z	\N	2026-08-03 12:53:16.512+00	2026-08-03 12:53:16.512+00	\N	\N
optval_01KZ5TBATGPAWY37FJNAZ097S1	Default option value	opt_01KZ5TBAT5ECGSY97CFN7JMWR1	\N	2026-08-04 07:20:59.986+00	2026-08-04 07:20:59.986+00	\N	\N
optval_01KZ5TFPDZ7WZE8XNGT2PRWYHR	Default option value	opt_01KZ5TFPDX2S2SXYHQF0A8BZ47	\N	2026-08-04 07:23:22.945+00	2026-08-04 07:23:22.945+00	\N	\N
optval_01KZ5TH6TGFQD8H7FBHF352QJF	Default option value	opt_01KZ5TH6TBG79CQ77AEHZ6JV9V	\N	2026-08-04 07:24:12.499+00	2026-08-04 07:24:12.499+00	\N	\N
optval_01KZ5TNNK79VEXNNGE6RHZSYEQ	Default option value	opt_01KZ5TNNK552S6QR5M76385W5J	\N	2026-08-04 07:26:38.697+00	2026-08-04 07:26:38.697+00	\N	\N
optval_01KZ5TR9KPPW1WY2YR3HT13SCQ	Default option value	opt_01KZ5TR9KK635GGGFVCDG270W0	\N	2026-08-04 07:28:04.727+00	2026-08-04 07:28:04.727+00	\N	\N
optval_01KZ5TTMM58DTSDZ0FQHWM24J9	Default option value	opt_01KZ5TTMM22NNDXJWRGTSB3A9M	\N	2026-08-04 07:29:21.542+00	2026-08-04 07:29:21.542+00	\N	\N
optval_01KZ5TXDB3VECXCH32QD845PXQ	Default option value	opt_01KZ5TXDB0YSJARAG7F2EGNW0A	\N	2026-08-04 07:30:52.389+00	2026-08-04 07:30:52.389+00	\N	\N
optval_01KZ5TYYK1ZV97X536K0PDW2PN	Default option value	opt_01KZ5TYYJWYMBSDDEXQ836GM4V	\N	2026-08-04 07:31:42.818+00	2026-08-04 07:31:42.818+00	\N	\N
\.


--
-- Data for Name: product_product_category_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_product_category_store_store (product_category_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
pcat_01KWPMF7B5DX84DH6RVNCG8GAT	store_01KWPMF6G1H0CEKN2BF32F0B2M	link_01KWPMF7E88RA3EXANZGRC3Q3H	2026-07-04 13:18:15.998958+00	2026-07-04 13:18:15.998958+00	\N
pcat_01KWPMF7B774D45Y04J9AHDG6W	store_01KWPMF6G1H0CEKN2BF32F0B2M	link_01KWPMF7EEE4SD896ZN0X020MK	2026-07-04 13:18:15.999029+00	2026-07-04 13:18:15.999029+00	\N
pcat_01KWPMF7B93EVDYAM4CGPP0C6X	store_01KWPMF6G1H0CEKN2BF32F0B2M	link_01KWPMF7EHSDY5DQ2Q634GV4KT	2026-07-04 13:18:15.999121+00	2026-07-04 13:18:15.999121+00	\N
pcat_01KWPMF7BAWGCKWAZN22GWX15P	store_01KWPMF6G1H0CEKN2BF32F0B2M	link_01KWPMF7EWKHZAKJ7T06BW2HBR	2026-07-04 13:18:16.021759+00	2026-07-04 13:18:16.021759+00	\N
pcat_01KXYNEQMDS86H6FHSW8E3NRK9	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KXYNEQNQZYCGEG7V0J4VSKEH	2026-07-20 02:25:05.71659+00	2026-07-22 03:04:09.523+00	2026-07-22 03:04:09.52+00
pcat_01KY3WFXSEM6Y44V3W4WGDMTEH	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KY3WFXTVDE4B14SERHX96434	2026-07-22 03:04:16.986459+00	2026-08-03 12:11:33.392+00	2026-08-03 12:11:33.39+00
pcat_01KZ3RNC4WW739HD3PYZBA7BY3	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3RNC64P2NNKE4ZRBW3YPVG	2026-08-03 12:13:03.042661+00	2026-08-03 12:13:03.042661+00	\N
pcat_01KZ3RP9A47GNB26FRFK1GSQQB	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3RP9B8QV98HN8YE5M9VPWH	2026-08-03 12:13:32.904241+00	2026-08-03 12:13:32.904241+00	\N
pcat_01KZ3S5MZPGC4Q0PKJXZ77AP50	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3S5N0J9VHV80HAH1V1HBAC	2026-08-03 12:21:56.369645+00	2026-08-03 12:21:56.369645+00	\N
pcat_01KZ3SGWH5AA8NRX9TYP358EXE	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3SGWJFZ4R6MS3NS9C10Z0X	2026-08-03 12:28:04.558918+00	2026-08-03 12:28:04.558918+00	\N
pcat_01KZ3SMS29GYY3312V16KS14SB	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3SMS39Y0VT3Y9K6RXA4N5H	2026-08-03 12:30:12.072463+00	2026-08-03 12:30:12.072463+00	\N
pcat_01KZ3S96ZVF592SGEVT2QGD098	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3S970VPAMDS65K9RPQW9YN	2026-08-03 12:23:53.114549+00	2026-08-06 13:26:30.476+00	2026-08-06 13:26:30.474+00
pcat_01KZ3RR9ZDDEFAJ42ZSM3QTF92	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3RRA0DG6B10CZYRW719RHT	2026-08-03 12:14:39.116375+00	2026-08-06 13:26:35.142+00	2026-08-06 13:26:35.136+00
pcat_01KZ3RWHFYJ8AHMNM2HJDZ8AJ2	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3RWHGZVRV17BWT7P6G6RAJ	2026-08-03 12:16:57.88728+00	2026-08-06 13:26:41.889+00	2026-08-06 13:26:41.888+00
pcat_01KZ3RY4BBWVB2QZ2WNJJRNV7D	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3RY4CB4W2JW87YAF31CTGH	2026-08-03 12:17:49.962672+00	2026-08-06 13:26:46.178+00	2026-08-06 13:26:46.173+00
pcat_01KZ3SCAW5ZJYXCMN6DGD3C5SJ	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3SCAXD9W9RPXASNTJZAKWS	2026-08-03 12:25:35.404315+00	2026-08-06 13:26:54.962+00	2026-08-06 13:26:54.958+00
pcat_01KZ3SFW8PTV186YJDWJF3SPYX	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3SFW9K98S08Y3G93W6EKPM	2026-08-03 12:27:31.506952+00	2026-08-06 13:27:00.41+00	2026-08-06 13:27:00.407+00
pcat_01KZ3S23JXHGXAK1G20TXT0PP6	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3S23KYMREKBF8MX514ARJ3	2026-08-03 12:20:00.253233+00	2026-08-06 13:28:36.532+00	2026-08-06 13:28:36.53+00
\.


--
-- Data for Name: product_product_collection_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_product_collection_store_store (product_collection_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
pcol_01KY3WE0X6BXFSZQE4DMPAST1G	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KY3WE0Z0KY5SVHW6SATVQXTG	2026-07-22 03:03:14.655254+00	2026-07-22 03:03:14.655254+00	\N
\.


--
-- Data for Name: product_product_option; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_product_option (id, product_id, product_option_id, created_at, updated_at, deleted_at) FROM stdin;
prodopt_01KWQ6ZREZJK69C738RDB2ZP3D	prod_01KWQ6ZRCPM82HMP1WC888MMTW	opt_01KWQ6ZRCQQN0QKAKBEG2JG9FZ	2026-07-04 18:41:52.099+00	2026-07-04 18:41:52.099+00	\N
prodopt_01KX1MP5JR1VY152XYJ44PG36W	prod_01KX1MP5GT70AMXB3ZR3ZWDJ2W	opt_01KX1MP5GVE06XKCAPN1AANZV3	2026-07-08 19:53:42.235+00	2026-07-08 20:02:43.332+00	2026-07-08 20:02:43.325+00
prodopt_01KX1NAR5P34MJZV8W3V8M7VDZ	prod_01KX1NAR4D4B7NCRM6S4R1HATV	opt_01KX1NAR4DGNT6Y3G9Z571RDRZ	2026-07-08 20:04:56.632+00	2026-07-22 03:03:41.859+00	2026-07-22 03:03:41.854+00
prodopt_01KY3WF62V9P9C4BWC2VQMQ1RB	prod_01KY3WF61A8ZS82SW750VEF3YS	opt_01KY3WF61B6PQSCBSXS624QFS6	2026-07-22 03:03:52.67+00	2026-08-03 12:32:02.88+00	2026-08-03 12:32:02.875+00
prodopt_01KZ3SYX16F8S1JRMXTK6BN6HS	prod_01KZ3SYWZB87P57Z1PD0T5RH7Z	opt_01KZ3SYWZCEH8B931HVTTN6RJ3	2026-08-03 12:35:43.784+00	2026-08-03 12:35:43.784+00	\N
prodopt_01KZ3TGWREJM441RYFBF2XW8MY	prod_01KZ3TGWQD1T8ZD99PE1T4R138	opt_01KZ3TGWQD6XBC46B9664XYQGM	2026-08-03 12:45:33.328+00	2026-08-03 12:45:33.328+00	\N
prodopt_01KZ3TM3V9C2J7EK8T5DCY2GDZ	prod_01KZ3TM3TF40YQW5F6FEDZCNB3	opt_01KZ3TM3TFN8FBZR15XXY7MB2T	2026-08-03 12:47:18.891+00	2026-08-03 12:50:42.693+00	2026-08-03 12:50:42.686+00
prodopt_01KZ3TWFC0CQ2MA4BHVBH1VYDZ	prod_01KZ3TWFAVPDMVXWAEZYFBZJ5P	opt_01KZ3TWFAVXRTFZA47F9YBZ9SC	2026-08-03 12:51:52.833+00	2026-08-03 12:51:52.833+00	\N
prodopt_01KZ3TZ13TMAW6CY2ZS6ZHP54V	prod_01KZ3TZ12N3Y3HAW8DENA6M1QQ	opt_01KZ3TZ12N7Q12FMYNMY4HD83Z	2026-08-03 12:53:16.541+00	2026-08-03 12:53:16.541+00	\N
prodopt_01KZ5TBAVADYKK4G0GH3WT6NYK	prod_01KZ5TBAT4SKW78XCV56FM5JRD	opt_01KZ5TBAT5ECGSY97CFN7JMWR1	2026-08-04 07:21:00.012+00	2026-08-04 07:21:00.012+00	\N
prodopt_01KZ5TFPEVRE94NT99Z0JK8470	prod_01KZ5TFPDWS8KJAK5MSEN8GHH4	opt_01KZ5TFPDX2S2SXYHQF0A8BZ47	2026-08-04 07:23:22.972+00	2026-08-04 07:23:22.972+00	\N
prodopt_01KZ5TH6VGBCFAAXJ182VV293Y	prod_01KZ5TH6TB2WG4D4P03SKRCG4M	opt_01KZ5TH6TBG79CQ77AEHZ6JV9V	2026-08-04 07:24:12.53+00	2026-08-04 07:24:12.53+00	\N
prodopt_01KZ5TNNM249PBYW0XZ5D6G9YV	prod_01KZ5TNNK4J4CFBE09JCFE728E	opt_01KZ5TNNK552S6QR5M76385W5J	2026-08-04 07:26:38.724+00	2026-08-04 07:26:38.724+00	\N
prodopt_01KZ5TR9MMMS815RE2TYH40EJX	prod_01KZ5TR9KKNDKZ1809RX9ECMXC	opt_01KZ5TR9KK635GGGFVCDG270W0	2026-08-04 07:28:04.758+00	2026-08-04 07:28:04.758+00	\N
prodopt_01KZ5TTMN2301SBGKN4XQ7RCW3	prod_01KZ5TTMM17296PHA0QDNHEHKY	opt_01KZ5TTMM22NNDXJWRGTSB3A9M	2026-08-04 07:29:21.572+00	2026-08-04 07:29:21.572+00	\N
prodopt_01KZ5TXDCCNK2VGX8T1578VWKW	prod_01KZ5TXDB07KDZ89FJ0MTRYAKJ	opt_01KZ5TXDB0YSJARAG7F2EGNW0A	2026-08-04 07:30:52.429+00	2026-08-04 07:30:52.429+00	\N
prodopt_01KZ5TYYKTGYKYMJK33BD78NFZ	prod_01KZ5TYYJWMGQ76KH4EN1ZK14R	opt_01KZ5TYYJWYMBSDDEXQ836GM4V	2026-08-04 07:31:42.843+00	2026-08-04 07:31:42.843+00	\N
\.


--
-- Data for Name: product_product_option_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_product_option_store_store (product_option_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: product_product_option_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_product_option_value (id, product_product_option_id, product_option_value_id, created_at, updated_at, deleted_at) FROM stdin;
prodoptval_01KWQ6ZRF1GT4826H1RG37G3HC	prodopt_01KWQ6ZREZJK69C738RDB2ZP3D	optval_01KWQ6ZRCZKAWTJPM21ZBQH5KW	2026-07-04 18:41:52.099+00	2026-07-04 18:41:52.099+00	\N
prodoptval_01KX1MP5JT499RPQMD17MZQ590	prodopt_01KX1MP5JR1VY152XYJ44PG36W	optval_01KX1MP5HBNGRFNWTEJAV6PXES	2026-07-08 19:53:42.236+00	2026-07-08 20:02:43.331+00	2026-07-08 20:02:43.321+00
prodoptval_01KX1NAR5Q2F4Y08N9Q1FZKG33	prodopt_01KX1NAR5P34MJZV8W3V8M7VDZ	optval_01KX1NAR4NTF3729PPWDBAR37A	2026-07-08 20:04:56.632+00	2026-07-22 03:03:41.858+00	2026-07-22 03:03:41.85+00
prodoptval_01KX1NAR5QBQM328MSEZMVVT2K	prodopt_01KX1NAR5P34MJZV8W3V8M7VDZ	optval_01KX1NAR4PEEXDGK5HAE4NW6GW	2026-07-08 20:04:56.632+00	2026-07-22 03:03:41.859+00	2026-07-22 03:03:41.85+00
prodoptval_01KX1NAR5QY76GZ42WTM9DJ5FH	prodopt_01KX1NAR5P34MJZV8W3V8M7VDZ	optval_01KX1NAR4PQM8EGERDC95KMCKM	2026-07-08 20:04:56.632+00	2026-07-22 03:03:41.859+00	2026-07-22 03:03:41.85+00
prodoptval_01KY3WF62XH24JJX3YHYD0JK7X	prodopt_01KY3WF62V9P9C4BWC2VQMQ1RB	optval_01KY3WF61MWXMQ9E04A7VVGHBM	2026-07-22 03:03:52.67+00	2026-08-03 12:32:02.88+00	2026-08-03 12:32:02.87+00
prodoptval_01KZ3SYX17NFMJNDWH9PRTDCPX	prodopt_01KZ3SYX16F8S1JRMXTK6BN6HS	optval_01KZ3SYWZRWXXEDWMCNX671W13	2026-08-03 12:35:43.785+00	2026-08-03 12:35:43.785+00	\N
prodoptval_01KZ3TGWRGXCTYA1TZCVJGQGEC	prodopt_01KZ3TGWREJM441RYFBF2XW8MY	optval_01KZ3TGWQGZ0377JQTE2BBBK7P	2026-08-03 12:45:33.329+00	2026-08-03 12:45:33.329+00	\N
prodoptval_01KZ3TM3VASGEPFCTWWE3BGVAK	prodopt_01KZ3TM3V9C2J7EK8T5DCY2GDZ	optval_01KZ3TM3TJBPP7S6D0JR7ANTPR	2026-08-03 12:47:18.891+00	2026-08-03 12:50:42.693+00	2026-08-03 12:50:42.681+00
prodoptval_01KZ3TWFC0VKCANYERAAG7TXDX	prodopt_01KZ3TWFC0CQ2MA4BHVBH1VYDZ	optval_01KZ3TWFAY61QMVJYR9C677N3Y	2026-08-03 12:51:52.833+00	2026-08-03 12:51:52.833+00	\N
prodoptval_01KZ3TZ13VV0JEVPAWT56R0JK5	prodopt_01KZ3TZ13TMAW6CY2ZS6ZHP54V	optval_01KZ3TZ12XAFR5NQXR6P14B08E	2026-08-03 12:53:16.541+00	2026-08-03 12:53:16.541+00	\N
prodoptval_01KZ5TBAVBK2BC1RE1FEV4B04B	prodopt_01KZ5TBAVADYKK4G0GH3WT6NYK	optval_01KZ5TBATGPAWY37FJNAZ097S1	2026-08-04 07:21:00.012+00	2026-08-04 07:21:00.012+00	\N
prodoptval_01KZ5TFPEWTT2T5QTX53QYXMYH	prodopt_01KZ5TFPEVRE94NT99Z0JK8470	optval_01KZ5TFPDZ7WZE8XNGT2PRWYHR	2026-08-04 07:23:22.972+00	2026-08-04 07:23:22.972+00	\N
prodoptval_01KZ5TH6VHMRPX52GTQCBS07F5	prodopt_01KZ5TH6VGBCFAAXJ182VV293Y	optval_01KZ5TH6TGFQD8H7FBHF352QJF	2026-08-04 07:24:12.53+00	2026-08-04 07:24:12.53+00	\N
prodoptval_01KZ5TNNM32T9ETS61T52GAE58	prodopt_01KZ5TNNM249PBYW0XZ5D6G9YV	optval_01KZ5TNNK79VEXNNGE6RHZSYEQ	2026-08-04 07:26:38.724+00	2026-08-04 07:26:38.724+00	\N
prodoptval_01KZ5TR9MNX3C7G7QAWC4CMZKB	prodopt_01KZ5TR9MMMS815RE2TYH40EJX	optval_01KZ5TR9KPPW1WY2YR3HT13SCQ	2026-08-04 07:28:04.759+00	2026-08-04 07:28:04.759+00	\N
prodoptval_01KZ5TTMN3GB6QPQ7X80PJ8CG9	prodopt_01KZ5TTMN2301SBGKN4XQ7RCW3	optval_01KZ5TTMM58DTSDZ0FQHWM24J9	2026-08-04 07:29:21.572+00	2026-08-04 07:29:21.572+00	\N
prodoptval_01KZ5TXDCC1XREPQA1YEA0XJ15	prodopt_01KZ5TXDCCNK2VGX8T1578VWKW	optval_01KZ5TXDB3VECXCH32QD845PXQ	2026-08-04 07:30:52.429+00	2026-08-04 07:30:52.429+00	\N
prodoptval_01KZ5TYYKTPDQ4TESVESRSNT9Q	prodopt_01KZ5TYYKTGYKYMJK33BD78NFZ	optval_01KZ5TYYK1ZV97X536K0PDW2PN	2026-08-04 07:31:42.843+00	2026-08-04 07:31:42.843+00	\N
\.


--
-- Data for Name: product_product_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_product_store_store (product_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
prod_01KWQ6ZRCPM82HMP1WC888MMTW	store_01KTJY1ZW9GNT71P3KE2DQ163D	link_01KWQ6ZRPSR0RY30PDR1MD52T3	2026-07-04 18:41:52.343553+00	2026-07-04 18:41:52.343553+00	\N
prod_01KX1MP5GT70AMXB3ZR3ZWDJ2W	store_01KTJY1ZW9GNT71P3KE2DQ163D	link_01KX1MP5TB0WNEN95QJHCKSF4N	2026-07-08 19:53:42.474633+00	2026-07-08 20:02:43.272+00	2026-07-08 20:02:43.266+00
prod_01KX1NAR4D4B7NCRM6S4R1HATV	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KX1NARHC543SSEZW03FNW528	2026-07-08 20:04:57.003857+00	2026-07-22 03:03:41.703+00	2026-07-22 03:03:41.688+00
prod_01KY3WF61A8ZS82SW750VEF3YS	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KY3WF6C7C4KS0HRJE0A5XT5X	2026-07-22 03:03:52.966186+00	2026-08-03 12:32:02.783+00	2026-08-03 12:32:02.772+00
prod_01KZ3SYWZB87P57Z1PD0T5RH7Z	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3SYXBCCMJ30ZQ1ZWX64FW7	2026-08-03 12:35:44.107476+00	2026-08-03 12:35:44.107476+00	\N
prod_01KZ3TGWQD1T8ZD99PE1T4R138	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3TGX3EX4WHSGBR5R3VNQ6N	2026-08-03 12:45:33.6781+00	2026-08-03 12:45:33.6781+00	\N
prod_01KZ3TM3TF40YQW5F6FEDZCNB3	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3TM419K61FZRNCDB4G0MPN	2026-08-03 12:47:19.08063+00	2026-08-03 12:50:42.621+00	2026-08-03 12:50:42.617+00
prod_01KZ3TWFAVPDMVXWAEZYFBZJ5P	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3TWFTQNAJDWVGCY49X1YPV	2026-08-03 12:51:53.302835+00	2026-08-03 12:51:53.302835+00	\N
prod_01KZ3TZ12N3Y3HAW8DENA6M1QQ	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ3TZ1JYYBNJCZ2BN47VNTTW	2026-08-03 12:53:17.022034+00	2026-08-03 12:53:17.022034+00	\N
prod_01KZ5TBAT4SKW78XCV56FM5JRD	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ5TBB53W2ZAQYCRFE05VE4G	2026-08-04 07:21:00.321256+00	2026-08-04 07:21:00.321256+00	\N
prod_01KZ5TFPDWS8KJAK5MSEN8GHH4	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ5TFPQQ0AY7KQEB3WCHQK9H	2026-08-04 07:23:23.25418+00	2026-08-04 07:23:23.25418+00	\N
prod_01KZ5TH6TB2WG4D4P03SKRCG4M	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ5TH750PK2C0YGH8FNHW94S	2026-08-04 07:24:12.831366+00	2026-08-04 07:24:12.831366+00	\N
prod_01KZ5TNNK4J4CFBE09JCFE728E	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ5TNNWJ3T8RPYM7KZEHHYD3	2026-08-04 07:26:38.993979+00	2026-08-04 07:26:38.993979+00	\N
prod_01KZ5TR9KKNDKZ1809RX9ECMXC	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ5TR9YCANE74BAD5AZCMRFX	2026-08-04 07:28:05.065308+00	2026-08-04 07:28:05.065308+00	\N
prod_01KZ5TTMM17296PHA0QDNHEHKY	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ5TTMX07VJMMBC36RYBCP05	2026-08-04 07:29:21.822829+00	2026-08-04 07:29:21.822829+00	\N
prod_01KZ5TXDB07KDZ89FJ0MTRYAKJ	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ5TXDMHGJHP0G1W4H4ZC3PS	2026-08-04 07:30:52.689033+00	2026-08-04 07:30:52.689033+00	\N
prod_01KZ5TYYJWMGQ76KH4EN1ZK14R	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZ5TYYVMGG548TXMDEWHF46V	2026-08-04 07:31:43.092079+00	2026-08-04 07:31:43.092079+00	\N
\.


--
-- Data for Name: product_sales_channel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_sales_channel (product_id, sales_channel_id, id, created_at, updated_at, deleted_at) FROM stdin;
prod_01KX1NAR4D4B7NCRM6S4R1HATV	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KX1NAR8MX7ZJW922KE1E9W6B	2026-07-08 20:04:56.723805+00	2026-07-22 03:03:41.662+00	2026-07-22 03:03:41.634+00
prod_01KY3WF61A8ZS82SW750VEF3YS	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KY3WF65PQNDBY1Q7J5X71CXG	2026-07-22 03:03:52.758092+00	2026-08-03 12:32:02.757+00	2026-08-03 12:32:02.74+00
prod_01KZ3SYWZB87P57Z1PD0T5RH7Z	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ3SYX464RF3J1AQX2ZNXK9E	2026-08-03 12:35:43.877933+00	2026-08-03 12:35:43.877933+00	\N
prod_01KZ3TGWQD1T8ZD99PE1T4R138	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ3TGWVEEZBZVG3AF9CA2XG2	2026-08-03 12:45:33.421634+00	2026-08-03 12:45:33.421634+00	\N
prod_01KZ3TM3TF40YQW5F6FEDZCNB3	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ3TM3WX9P25Q76VZD1M27A1	2026-08-03 12:47:18.941242+00	2026-08-03 12:50:42.587+00	2026-08-03 12:50:42.579+00
prod_01KZ3TWFAVPDMVXWAEZYFBZJ5P	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ3TWFFX8ZX152Y237CXD78J	2026-08-03 12:51:52.950322+00	2026-08-03 12:51:52.950322+00	\N
prod_01KZ3TZ12N3Y3HAW8DENA6M1QQ	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ3TZ19EVDBKCN7CXFH5H1ZB	2026-08-03 12:53:16.718006+00	2026-08-03 12:53:16.718006+00	\N
prod_01KZ5TBAT4SKW78XCV56FM5JRD	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ5TBAXFY0YJS6R2XQWKJP0B	2026-08-04 07:21:00.077279+00	2026-08-04 07:21:00.077279+00	\N
prod_01KZ5TFPDWS8KJAK5MSEN8GHH4	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ5TFPGYEZ2D2T1V03XKETTM	2026-08-04 07:23:23.037156+00	2026-08-04 07:23:23.037156+00	\N
prod_01KZ5TH6TB2WG4D4P03SKRCG4M	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ5TH6Y4QFQ91GBNN5Y18BTH	2026-08-04 07:24:12.610139+00	2026-08-04 07:24:12.610139+00	\N
prod_01KZ5TNNK4J4CFBE09JCFE728E	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ5TNNP401XEW05YJERTW4ZF	2026-08-04 07:26:38.787671+00	2026-08-04 07:26:38.787671+00	\N
prod_01KZ5TR9KKNDKZ1809RX9ECMXC	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ5TR9PWQXERRY7G6TMFRBFD	2026-08-04 07:28:04.827344+00	2026-08-04 07:28:04.827344+00	\N
prod_01KZ5TTMM17296PHA0QDNHEHKY	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ5TTMQ148YXQ6G5H6BYGZ9P	2026-08-04 07:29:21.632893+00	2026-08-04 07:29:21.632893+00	\N
prod_01KZ5TXDB07KDZ89FJ0MTRYAKJ	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ5TXDEJM94VP9D52T6SV1V1	2026-08-04 07:30:52.496733+00	2026-08-04 07:30:52.496733+00	\N
prod_01KZ5TYYJWMGQ76KH4EN1ZK14R	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	prodsc_01KZ5TYYNQ24K4334D46GNHCNC	2026-08-04 07:31:42.902996+00	2026-08-04 07:31:42.902996+00	\N
\.


--
-- Data for Name: product_shipping_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_shipping_profile (product_id, shipping_profile_id, id, created_at, updated_at, deleted_at) FROM stdin;
prod_01KX1NAR4D4B7NCRM6S4R1HATV	sp_01KX2X561R7XT7FWKJP16G9G4F	prodsp_01KX2Y8SG3BKG2CWBAQQM45SJF	2026-07-09 08:00:24.064424+00	2026-07-09 08:00:54.447+00	2026-07-09 08:00:54.444+00
\.


--
-- Data for Name: product_tag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_tag (id, value, metadata, created_at, updated_at, deleted_at, external_id) FROM stdin;
\.


--
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_tags (product_id, product_tag_id) FROM stdin;
\.


--
-- Data for Name: product_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_type (id, value, metadata, created_at, updated_at, deleted_at, external_id) FROM stdin;
ptyp_01KXAHN7N84RPKZRWZA4T3F6WG	نوع یک	\N	2026-07-12 06:53:55.753+00	2026-07-12 06:54:06.837+00	2026-07-12 06:54:06.837+00	\N
\.


--
-- Data for Name: product_variant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variant (id, title, sku, barcode, ean, upc, allow_backorder, manage_inventory, hs_code, origin_country, mid_code, material, weight, length, height, width, metadata, variant_rank, product_id, created_at, updated_at, deleted_at, thumbnail) FROM stdin;
variant_01KX1NARB5XWW4WRP6H7PPNB5D	100	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KX1NAR4D4B7NCRM6S4R1HATV	2026-07-08 20:04:56.809+00	2026-07-22 03:03:41.604+00	2026-07-22 03:03:41.544+00	\N
variant_01KX1NARB7AND1V01Z4QMF65DB	200	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	prod_01KX1NAR4D4B7NCRM6S4R1HATV	2026-07-08 20:04:56.81+00	2026-07-22 03:03:41.605+00	2026-07-22 03:03:41.544+00	\N
variant_01KX1NARB7KB2SX9PZSXW51DB3	300	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	prod_01KX1NAR4D4B7NCRM6S4R1HATV	2026-07-08 20:04:56.81+00	2026-07-22 03:03:41.605+00	2026-07-22 03:03:41.544+00	\N
variant_01KY3WF67KV8RQ4VMED0P8S3S9	Default variant	\N	\N	\N	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KY3WF61A8ZS82SW750VEF3YS	2026-07-22 03:03:52.819+00	2026-08-03 12:32:02.768+00	2026-08-03 12:32:02.732+00	\N
variant_01KZ3SYX67W9KKYVE2ENZ04M6K	Default variant	024001009	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ3SYWZB87P57Z1PD0T5RH7Z	2026-08-03 12:35:43.944+00	2026-08-03 12:35:43.945+00	\N	\N
variant_01KZ3TGWY71Q7T5RGX9VJEBEQJ	Default variant	024001010	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ3TGWQD1T8ZD99PE1T4R138	2026-08-03 12:45:33.512+00	2026-08-03 12:45:33.512+00	\N	\N
variant_01KZ3TM3Y8YTAX82EECZF77987	Default variant	024001011	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ3TM3TF40YQW5F6FEDZCNB3	2026-08-03 12:47:18.985+00	2026-08-03 12:50:42.597+00	2026-08-03 12:50:42.559+00	\N
variant_01KZ3TWFHHT3AEG5K34SWCRWC5	Default variant	024001011	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ3TWFAVPDMVXWAEZYFBZJ5P	2026-08-03 12:51:53.009+00	2026-08-03 12:51:53.009+00	\N	\N
variant_01KZ3TZ1D61MQPRC5H8YWV6A9Q	Default variant	024001012	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ3TZ12N3Y3HAW8DENA6M1QQ	2026-08-03 12:53:16.839+00	2026-08-03 12:53:16.839+00	\N	\N
variant_01KZ5TBAZ7BDP7A964QEDQ24BM	Default variant	024001013	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ5TBAT4SKW78XCV56FM5JRD	2026-08-04 07:21:00.135+00	2026-08-04 07:21:00.135+00	\N	\N
variant_01KZ5TFPJCZZXPASRP5WBTP8M9	Default variant	024001014	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ5TFPDWS8KJAK5MSEN8GHH4	2026-08-04 07:23:23.085+00	2026-08-04 07:23:23.085+00	\N	\N
variant_01KZ5TH6ZVD9Q6RK2JJZGDB7HA	Default variant	024001015	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ5TH6TB2WG4D4P03SKRCG4M	2026-08-04 07:24:12.668+00	2026-08-04 07:24:12.668+00	\N	\N
variant_01KZ5TNNQRSZRCAGSTY54QRW1C	Default variant	024001016	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ5TNNK4J4CFBE09JCFE728E	2026-08-04 07:26:38.841+00	2026-08-04 07:26:38.841+00	\N	\N
variant_01KZ5TR9R60X02T4F5YXZBBWKN	Default variant	024001017	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ5TR9KKNDKZ1809RX9ECMXC	2026-08-04 07:28:04.871+00	2026-08-04 07:28:04.871+00	\N	\N
variant_01KZ5TTMR9ETG8WXFYY74Z2FB1	Default variant	024001018	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ5TTMM17296PHA0QDNHEHKY	2026-08-04 07:29:21.673+00	2026-08-04 07:29:21.673+00	\N	\N
variant_01KZ5TXDFWFNYABXN19847W3E2	Default variant	024001019	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ5TXDB07KDZ89FJ0MTRYAKJ	2026-08-04 07:30:52.541+00	2026-08-04 07:30:52.541+00	\N	\N
variant_01KZ5TYYQ2W0PRBG2EC4FQ7NWE	Default variant	024001020	\N	\N	\N	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	prod_01KZ5TYYJWMGQ76KH4EN1ZK14R	2026-08-04 07:31:42.946+00	2026-08-04 07:31:42.946+00	\N	\N
\.


--
-- Data for Name: product_variant_inventory_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variant_inventory_item (variant_id, inventory_item_id, id, required_quantity, created_at, updated_at, deleted_at) FROM stdin;
variant_01KZ3TGWY71Q7T5RGX9VJEBEQJ	iitem_01KZ3TGWZ9BP95J2MD69ZYPM74	pvitem_01KZ3TGX0KPZDT584SE6BQ9AMH	1	2026-08-03 12:45:33.586664+00	2026-08-03 12:45:33.586664+00	\N
variant_01KZ3TM3Y8YTAX82EECZF77987	iitem_01KZ3TM3YWKQ3MG9T63CR9ZJW2	pvitem_01KZ3TM3ZMKXCRGYWWGBPG5B01	1	2026-08-03 12:47:19.027628+00	2026-08-03 12:50:42.525+00	2026-08-03 12:50:42.523+00
variant_01KZ3TWFHHT3AEG5K34SWCRWC5	iitem_01KZ3TWFJGN5RD5GXTSSGHSCQB	pvitem_01KZ3TWFM4JNMZGCWWB5KPQERF	1	2026-08-03 12:51:53.091308+00	2026-08-03 12:51:53.091308+00	\N
variant_01KZ3TZ1D61MQPRC5H8YWV6A9Q	iitem_01KZ3TZ1EEYCX12Z6CXSSQNCSM	pvitem_01KZ3TZ1FKHM8C03163RFEVR6S	1	2026-08-03 12:53:16.91482+00	2026-08-03 12:53:16.91482+00	\N
variant_01KZ5TBAZ7BDP7A964QEDQ24BM	iitem_01KZ5TBB0ET8HJZGPQBWT8TAW6	pvitem_01KZ5TBB1WXE74E2S1EYSJC387	1	2026-08-04 07:21:00.219077+00	2026-08-04 07:21:00.219077+00	\N
variant_01KZ5TFPJCZZXPASRP5WBTP8M9	iitem_01KZ5TFPKA203EPKFGE1MXCSFH	pvitem_01KZ5TFPMK6GHAM3JXZHXAGRBZ	1	2026-08-04 07:23:23.154594+00	2026-08-04 07:23:23.154594+00	\N
variant_01KZ5TH6ZVD9Q6RK2JJZGDB7HA	iitem_01KZ5TH70SJFW007MAG1EEJ1Q1	pvitem_01KZ5TH71RCGTZ7V20221N46B1	1	2026-08-04 07:24:12.728231+00	2026-08-04 07:24:12.728231+00	\N
variant_01KZ5TNNQRSZRCAGSTY54QRW1C	iitem_01KZ5TNNRVEN5YCSSS0DQB9RQG	pvitem_01KZ5TNNT1BZ19PCQY39GKH3HW	1	2026-08-04 07:26:38.912365+00	2026-08-04 07:26:38.912365+00	\N
variant_01KZ5TR9R60X02T4F5YXZBBWKN	iitem_01KZ5TR9S74VB1RWNSV5ZXP0BJ	pvitem_01KZ5TR9TPTZA5G4ZJRCAXNBD1	1	2026-08-04 07:28:04.949176+00	2026-08-04 07:28:04.949176+00	\N
variant_01KZ5TTMR9ETG8WXFYY74Z2FB1	iitem_01KZ5TTMS78ZCZP814HWX26JEF	pvitem_01KZ5TTMT70C828RC91AGA5JBV	1	2026-08-04 07:29:21.734453+00	2026-08-04 07:29:21.734453+00	\N
variant_01KZ5TXDFWFNYABXN19847W3E2	iitem_01KZ5TXDGRDHW61K1BWKXWN811	pvitem_01KZ5TXDHTJEEEZPJ88RJWS1MG	1	2026-08-04 07:30:52.602131+00	2026-08-04 07:30:52.602131+00	\N
variant_01KZ5TYYQ2W0PRBG2EC4FQ7NWE	iitem_01KZ5TYYQYBVC8QP177HNS0QBB	pvitem_01KZ5TYYS10YYZSHEWVYT4D7T7	1	2026-08-04 07:31:43.008881+00	2026-08-04 07:31:43.008881+00	\N
\.


--
-- Data for Name: product_variant_option; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variant_option (variant_id, option_value_id) FROM stdin;
variant_01KX1NARB5XWW4WRP6H7PPNB5D	optval_01KX1NAR4NTF3729PPWDBAR37A
variant_01KX1NARB7AND1V01Z4QMF65DB	optval_01KX1NAR4PEEXDGK5HAE4NW6GW
variant_01KX1NARB7KB2SX9PZSXW51DB3	optval_01KX1NAR4PQM8EGERDC95KMCKM
variant_01KY3WF67KV8RQ4VMED0P8S3S9	optval_01KY3WF61MWXMQ9E04A7VVGHBM
variant_01KZ3SYX67W9KKYVE2ENZ04M6K	optval_01KZ3SYWZRWXXEDWMCNX671W13
variant_01KZ3TGWY71Q7T5RGX9VJEBEQJ	optval_01KZ3TGWQGZ0377JQTE2BBBK7P
variant_01KZ3TM3Y8YTAX82EECZF77987	optval_01KZ3TM3TJBPP7S6D0JR7ANTPR
variant_01KZ3TWFHHT3AEG5K34SWCRWC5	optval_01KZ3TWFAY61QMVJYR9C677N3Y
variant_01KZ3TZ1D61MQPRC5H8YWV6A9Q	optval_01KZ3TZ12XAFR5NQXR6P14B08E
variant_01KZ5TBAZ7BDP7A964QEDQ24BM	optval_01KZ5TBATGPAWY37FJNAZ097S1
variant_01KZ5TFPJCZZXPASRP5WBTP8M9	optval_01KZ5TFPDZ7WZE8XNGT2PRWYHR
variant_01KZ5TH6ZVD9Q6RK2JJZGDB7HA	optval_01KZ5TH6TGFQD8H7FBHF352QJF
variant_01KZ5TNNQRSZRCAGSTY54QRW1C	optval_01KZ5TNNK79VEXNNGE6RHZSYEQ
variant_01KZ5TR9R60X02T4F5YXZBBWKN	optval_01KZ5TR9KPPW1WY2YR3HT13SCQ
variant_01KZ5TTMR9ETG8WXFYY74Z2FB1	optval_01KZ5TTMM58DTSDZ0FQHWM24J9
variant_01KZ5TXDFWFNYABXN19847W3E2	optval_01KZ5TXDB3VECXCH32QD845PXQ
variant_01KZ5TYYQ2W0PRBG2EC4FQ7NWE	optval_01KZ5TYYK1ZV97X536K0PDW2PN
\.


--
-- Data for Name: product_variant_price_set; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variant_price_set (variant_id, price_set_id, id, created_at, updated_at, deleted_at) FROM stdin;
variant_01KX1NARB5XWW4WRP6H7PPNB5D	pset_01KX1NARDXCR09DPD3J3JS5F14	pvps_01KX1NARFYCMVNC6W69GXY36GX	2026-07-08 20:04:56.957163+00	2026-07-22 03:03:41.617+00	2026-07-22 03:03:41.587+00
variant_01KX1NARB7AND1V01Z4QMF65DB	pset_01KX1NARDYY1Q8KA3JRN5XT14R	pvps_01KX1NARG09CR47BFPZM7RNNFV	2026-07-08 20:04:56.957163+00	2026-07-22 03:03:41.618+00	2026-07-22 03:03:41.587+00
variant_01KX1NARB7KB2SX9PZSXW51DB3	pset_01KX1NARDZ3MDAF7J0SKR7JJQQ	pvps_01KX1NARG0KS2C37SGEHKC2KQK	2026-07-08 20:04:56.957163+00	2026-07-22 03:03:41.618+00	2026-07-22 03:03:41.587+00
variant_01KY3WF67KV8RQ4VMED0P8S3S9	pset_01KY3WF69RHWQC14DH61BSZZ1A	pvps_01KY3WF6AXE9TQ486HYJTY3YHP	2026-07-22 03:03:52.925122+00	2026-08-03 12:32:02.757+00	2026-08-03 12:32:02.738+00
variant_01KZ3SYX67W9KKYVE2ENZ04M6K	pset_01KZ3SYX8PV26HHKC8EMQ4VG2W	pvps_01KZ3SYXA0D926YF6TWMR53GM0	2026-08-03 12:35:44.063601+00	2026-08-03 12:35:44.063601+00	\N
variant_01KZ3TGWY71Q7T5RGX9VJEBEQJ	pset_01KZ3TGX16F6W920YAAV1NTSA4	pvps_01KZ3TGX27FQRTCPWB71J82EY2	2026-08-03 12:45:33.638424+00	2026-08-03 12:45:33.638424+00	\N
variant_01KZ3TM3Y8YTAX82EECZF77987	pset_01KZ3TM3ZZ0QGBCFDPX4GC7T7W	pvps_01KZ3TM40M3QTFA5X0YFJ8EN3Q	2026-08-03 12:47:19.060308+00	2026-08-03 12:50:42.58+00	2026-08-03 12:50:42.569+00
variant_01KZ3TWFHHT3AEG5K34SWCRWC5	pset_01KZ3TWFN0466M824RX4FKZ0HA	pvps_01KZ3TWFQKFWSCZ0J2S14PP499	2026-08-03 12:51:53.20258+00	2026-08-03 12:51:53.20258+00	\N
variant_01KZ3TZ1D61MQPRC5H8YWV6A9Q	pset_01KZ3TZ1G9SYAKFDNXCFNW75MB	pvps_01KZ3TZ1HK2BQF8B1F03W7FRA6	2026-08-03 12:53:16.978112+00	2026-08-03 12:53:16.978112+00	\N
variant_01KZ5TBAZ7BDP7A964QEDQ24BM	pset_01KZ5TBB2EZXA6ETDH94VR2F66	pvps_01KZ5TBB3T8GKZQJ5W81TXZG3Q	2026-08-04 07:21:00.281132+00	2026-08-04 07:21:00.281132+00	\N
variant_01KZ5TFPJCZZXPASRP5WBTP8M9	pset_01KZ5TFPN7WKCT6XNC2N01E2FP	pvps_01KZ5TFPPBC4RFRXZ7KJJ16J6G	2026-08-04 07:23:23.210533+00	2026-08-04 07:23:23.210533+00	\N
variant_01KZ5TH6ZVD9Q6RK2JJZGDB7HA	pset_01KZ5TH72EZ448QCMFN1VG9YRE	pvps_01KZ5TH73JNMRT2K67ZB8CKTEZ	2026-08-04 07:24:12.785567+00	2026-08-04 07:24:12.785567+00	\N
variant_01KZ5TNNQRSZRCAGSTY54QRW1C	pset_01KZ5TNNTKKJNGVWHST5TZKB47	pvps_01KZ5TNNVNKJ5JED8VJ07SS6CG	2026-08-04 07:26:38.964436+00	2026-08-04 07:26:38.964436+00	\N
variant_01KZ5TR9R60X02T4F5YXZBBWKN	pset_01KZ5TR9VEKWBXEWZ17CKV1FQW	pvps_01KZ5TR9WWZZJAW6DX4TWPYM4S	2026-08-04 07:28:05.019691+00	2026-08-04 07:28:05.019691+00	\N
variant_01KZ5TTMR9ETG8WXFYY74Z2FB1	pset_01KZ5TTMTPME4RMP0GXVBP5BRY	pvps_01KZ5TTMVV7QQMD418YMKY2YVZ	2026-08-04 07:29:21.786173+00	2026-08-04 07:29:21.786173+00	\N
variant_01KZ5TXDFWFNYABXN19847W3E2	pset_01KZ5TXDJBKNKTFAPS2QWKWPHZ	pvps_01KZ5TXDK87W0HJHDR4XQNTKG2	2026-08-04 07:30:52.647825+00	2026-08-04 07:30:52.647825+00	\N
variant_01KZ5TYYQ2W0PRBG2EC4FQ7NWE	pset_01KZ5TYYSEY2NY8T8Z9MPJPWDX	pvps_01KZ5TYYTMFRDJ6QA66YEQ916V	2026-08-04 07:31:43.059931+00	2026-08-04 07:31:43.059931+00	\N
\.


--
-- Data for Name: product_variant_product_image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variant_product_image (id, variant_id, image_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: promotion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion (id, code, campaign_id, is_automatic, type, created_at, updated_at, deleted_at, status, is_tax_inclusive, "limit", used, metadata) FROM stdin;
\.


--
-- Data for Name: promotion_application_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_application_method (id, value, raw_value, max_quantity, apply_to_quantity, buy_rules_min_quantity, type, target_type, allocation, promotion_id, created_at, updated_at, deleted_at, currency_code) FROM stdin;
\.


--
-- Data for Name: promotion_campaign; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_campaign (id, name, description, campaign_identifier, starts_at, ends_at, created_at, updated_at, deleted_at) FROM stdin;
procamp_01KZBY6ATN8TMWNDZWXQM57JWA	کمپین شهریور		shahrivar_campaign	2026-08-20 04:30:00+00	2026-09-20 04:30:00+00	2026-08-06 16:23:37.054+00	2026-08-06 16:23:37.054+00	\N
\.


--
-- Data for Name: promotion_campaign_budget; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_campaign_budget (id, type, campaign_id, "limit", raw_limit, used, raw_used, created_at, updated_at, deleted_at, currency_code, attribute) FROM stdin;
probudg_01KZBY6ATTAFKRXPKGH69GQ9SK	usage	procamp_01KZBY6ATN8TMWNDZWXQM57JWA	\N	\N	0	{"value": "0", "precision": 20}	2026-08-06 16:23:37.051+00	2026-08-06 16:23:37.051+00	\N	\N	\N
\.


--
-- Data for Name: promotion_campaign_budget_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_campaign_budget_usage (id, attribute_value, used, budget_id, raw_used, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: promotion_campaign_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_campaign_store_store (campaign_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
procamp_01KZBY6ATN8TMWNDZWXQM57JWA	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KZBY6AWWJ0BMVH9PYH69CVVM	2026-08-06 16:23:37.115238+00	2026-08-06 16:23:37.115238+00	\N
\.


--
-- Data for Name: promotion_promotion_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_promotion_rule (promotion_id, promotion_rule_id) FROM stdin;
\.


--
-- Data for Name: promotion_promotion_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_promotion_store_store (promotion_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: promotion_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_rule (id, description, attribute, operator, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: promotion_rule_value; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_rule_value (id, promotion_rule_id, value, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: property_label; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.property_label (id, entity, property, label, description, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: provider_identity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.provider_identity (id, entity_id, provider, auth_identity_id, user_metadata, provider_metadata, created_at, updated_at, deleted_at) FROM stdin;
01KWPMHWRANCPRMHFW4ZW8T04B	sayeyesepidar@gmail.com	emailpass	authid_01KWPMHWRCK189M4K9GTVRGN1Q	\N	{"password": "c2NyeXB0AA8AAAAIAAAAAfX3YvSSA60oHZuvwudzKGhJxLAF/IAATHE3HXxqMFnvdP3XCB6/1zvo/Bln+3SY8avVM+AyHVlgrZgA5/lnTE1Y8bPmnkKmBdHj8nRomvv4"}	2026-07-04 13:19:43.374+00	2026-07-04 13:19:43.374+00	\N
01KWQ6ZR3GVSDRP8BWTMSMY5VZ	superadmin@liasa.com	emailpass	authid_01KWQ6ZR3N4YNJ4JZ5KK1SG250	\N	{"password": "c2NyeXB0AA8AAAAIAAAAARNapqkzHFbJjbL4Cio6Xdbvf1QCpLa9SlwsIeFwQJSEryAWQrQq9dg1TZJHFiHmhBTVKDcq0EiKNuj17lvxH1gxDY6g5jxKMd5GKojIa5D3"}	2026-07-04 18:41:51.736+00	2026-07-04 18:41:51.736+00	\N
01KX1MP5AAQ67N9ZJKTETMZVS7	tabeshelecshop@gmail.com	emailpass	authid_01KX1MP5AB3T92DBN65P4X2V3P	\N	{"password": "c2NyeXB0AA8AAAAIAAAAAT1BTvhr8Vx9FKJ6b/g0fGLaAAb3+gVwvnEAHaGWFiy0jJasqvlURyVPJHY356EyiCofWtOrrev6Iu5JdbjFxziz8enGMUIeQ3tkvGC/K6BN"}	2026-07-08 19:53:41.964+00	2026-07-08 19:53:41.964+00	\N
\.


--
-- Data for Name: publishable_api_key_sales_channel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.publishable_api_key_sales_channel (publishable_key_id, sales_channel_id, id, created_at, updated_at, deleted_at) FROM stdin;
apk_01KWPMF6CNP8B7E1PPAEG4JAZ5	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	pksc_01KWPMF6E74D352RBFFSQDY96K	2026-07-04 13:18:14.981396+00	2026-07-04 13:18:14.981396+00	\N
\.


--
-- Data for Name: refund; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refund (id, amount, raw_amount, payment_id, created_at, updated_at, deleted_at, created_by, metadata, refund_reason_id, note) FROM stdin;
\.


--
-- Data for Name: refund_reason; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refund_reason (id, label, description, metadata, created_at, updated_at, deleted_at, code) FROM stdin;
refr_01KWPMEEZBFQVQ0WTDRJBCC6HD	Shipping Issue	Refund due to lost, delayed, or misdelivered shipment	\N	2026-07-04 13:17:50.356764+00	2026-07-04 13:17:50.356764+00	\N	shipping_issue
refr_01KWPMEEZC2YWNGFDWA9NWG2QS	Customer Care Adjustment	Refund given as goodwill or compensation for inconvenience	\N	2026-07-04 13:17:50.356764+00	2026-07-04 13:17:50.356764+00	\N	customer_care_adjustment
refr_01KWPMEEZCDV52VAJM0EEJT8GR	Pricing Error	Refund to correct an overcharge, missing discount, or incorrect price	\N	2026-07-04 13:17:50.356764+00	2026-07-04 13:17:50.356764+00	\N	pricing_error
\.


--
-- Data for Name: region; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.region (id, name, currency_code, metadata, created_at, updated_at, deleted_at, automatic_taxes) FROM stdin;
reg_01KWPMF6JRM4THSDMV3YPVPFQB	ایران	irr	\N	2026-07-04 13:18:15.154+00	2026-07-08 20:01:43.19+00	\N	f
\.


--
-- Data for Name: region_country; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.region_country (iso_2, iso_3, num_code, name, display_name, region_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
af	afg	004	AFGHANISTAN	Afghanistan	\N	\N	2026-07-04 13:18:12.269+00	2026-07-04 13:18:12.269+00	\N
al	alb	008	ALBANIA	Albania	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
dz	dza	012	ALGERIA	Algeria	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
as	asm	016	AMERICAN SAMOA	American Samoa	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
ad	and	020	ANDORRA	Andorra	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
ao	ago	024	ANGOLA	Angola	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
ai	aia	660	ANGUILLA	Anguilla	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
aq	ata	010	ANTARCTICA	Antarctica	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
ag	atg	028	ANTIGUA AND BARBUDA	Antigua and Barbuda	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
ar	arg	032	ARGENTINA	Argentina	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
am	arm	051	ARMENIA	Armenia	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
aw	abw	533	ARUBA	Aruba	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
au	aus	036	AUSTRALIA	Australia	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
at	aut	040	AUSTRIA	Austria	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
az	aze	031	AZERBAIJAN	Azerbaijan	\N	\N	2026-07-04 13:18:12.272+00	2026-07-04 13:18:12.272+00	\N
bs	bhs	044	BAHAMAS	Bahamas	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bh	bhr	048	BAHRAIN	Bahrain	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bd	bgd	050	BANGLADESH	Bangladesh	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bb	brb	052	BARBADOS	Barbados	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
by	blr	112	BELARUS	Belarus	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
be	bel	056	BELGIUM	Belgium	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bz	blz	084	BELIZE	Belize	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bj	ben	204	BENIN	Benin	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bm	bmu	060	BERMUDA	Bermuda	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bt	btn	064	BHUTAN	Bhutan	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bo	bol	068	BOLIVIA	Bolivia	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bq	bes	535	BONAIRE, SINT EUSTATIUS AND SABA	Bonaire, Sint Eustatius and Saba	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
ba	bih	070	BOSNIA AND HERZEGOVINA	Bosnia and Herzegovina	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bw	bwa	072	BOTSWANA	Botswana	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bv	bvd	074	BOUVET ISLAND	Bouvet Island	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
br	bra	076	BRAZIL	Brazil	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
io	iot	086	BRITISH INDIAN OCEAN TERRITORY	British Indian Ocean Territory	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bn	brn	096	BRUNEI DARUSSALAM	Brunei Darussalam	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bg	bgr	100	BULGARIA	Bulgaria	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bf	bfa	854	BURKINA FASO	Burkina Faso	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
bi	bdi	108	BURUNDI	Burundi	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
kh	khm	116	CAMBODIA	Cambodia	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cm	cmr	120	CAMEROON	Cameroon	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
ca	can	124	CANADA	Canada	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cv	cpv	132	CAPE VERDE	Cape Verde	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
ky	cym	136	CAYMAN ISLANDS	Cayman Islands	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cf	caf	140	CENTRAL AFRICAN REPUBLIC	Central African Republic	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
td	tcd	148	CHAD	Chad	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cl	chl	152	CHILE	Chile	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cn	chn	156	CHINA	China	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cx	cxr	162	CHRISTMAS ISLAND	Christmas Island	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cc	cck	166	COCOS (KEELING) ISLANDS	Cocos (Keeling) Islands	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
co	col	170	COLOMBIA	Colombia	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
km	com	174	COMOROS	Comoros	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cg	cog	178	CONGO	Congo	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cd	cod	180	CONGO, THE DEMOCRATIC REPUBLIC OF THE	Congo, the Democratic Republic of the	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
ck	cok	184	COOK ISLANDS	Cook Islands	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cr	cri	188	COSTA RICA	Costa Rica	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
ci	civ	384	COTE D'IVOIRE	Cote D'Ivoire	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
hr	hrv	191	CROATIA	Croatia	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cu	cub	192	CUBA	Cuba	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cw	cuw	531	CURAÇAO	Curaçao	\N	\N	2026-07-04 13:18:12.273+00	2026-07-04 13:18:12.273+00	\N
cy	cyp	196	CYPRUS	Cyprus	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
cz	cze	203	CZECH REPUBLIC	Czech Republic	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
dk	dnk	208	DENMARK	Denmark	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
dj	dji	262	DJIBOUTI	Djibouti	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
dm	dma	212	DOMINICA	Dominica	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
do	dom	214	DOMINICAN REPUBLIC	Dominican Republic	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
ec	ecu	218	ECUADOR	Ecuador	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
eg	egy	818	EGYPT	Egypt	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
sv	slv	222	EL SALVADOR	El Salvador	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gq	gnq	226	EQUATORIAL GUINEA	Equatorial Guinea	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
er	eri	232	ERITREA	Eritrea	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
ee	est	233	ESTONIA	Estonia	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
et	eth	231	ETHIOPIA	Ethiopia	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
fk	flk	238	FALKLAND ISLANDS (MALVINAS)	Falkland Islands (Malvinas)	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
fo	fro	234	FAROE ISLANDS	Faroe Islands	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
fj	fji	242	FIJI	Fiji	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
fi	fin	246	FINLAND	Finland	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
fr	fra	250	FRANCE	France	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gf	guf	254	FRENCH GUIANA	French Guiana	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
pf	pyf	258	FRENCH POLYNESIA	French Polynesia	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
tf	atf	260	FRENCH SOUTHERN TERRITORIES	French Southern Territories	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
ga	gab	266	GABON	Gabon	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gm	gmb	270	GAMBIA	Gambia	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
ge	geo	268	GEORGIA	Georgia	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
de	deu	276	GERMANY	Germany	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gh	gha	288	GHANA	Ghana	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gi	gib	292	GIBRALTAR	Gibraltar	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gr	grc	300	GREECE	Greece	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gl	grl	304	GREENLAND	Greenland	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gd	grd	308	GRENADA	Grenada	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gp	glp	312	GUADELOUPE	Guadeloupe	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gu	gum	316	GUAM	Guam	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gt	gtm	320	GUATEMALA	Guatemala	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gg	ggy	831	GUERNSEY	Guernsey	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gn	gin	324	GUINEA	Guinea	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gw	gnb	624	GUINEA-BISSAU	Guinea-Bissau	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
gy	guy	328	GUYANA	Guyana	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
ht	hti	332	HAITI	Haiti	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
hm	hmd	334	HEARD ISLAND AND MCDONALD ISLANDS	Heard Island And Mcdonald Islands	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
va	vat	336	HOLY SEE (VATICAN CITY STATE)	Holy See (Vatican City State)	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
hn	hnd	340	HONDURAS	Honduras	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
hk	hkg	344	HONG KONG	Hong Kong	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
hu	hun	348	HUNGARY	Hungary	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
is	isl	352	ICELAND	Iceland	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
in	ind	356	INDIA	India	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
id	idn	360	INDONESIA	Indonesia	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
iq	irq	368	IRAQ	Iraq	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.274+00	\N
ie	irl	372	IRELAND	Ireland	\N	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:12.275+00	\N
im	imn	833	ISLE OF MAN	Isle Of Man	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
il	isr	376	ISRAEL	Israel	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
it	ita	380	ITALY	Italy	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
jm	jam	388	JAMAICA	Jamaica	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
jp	jpn	392	JAPAN	Japan	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
je	jey	832	JERSEY	Jersey	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
jo	jor	400	JORDAN	Jordan	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
kz	kaz	398	KAZAKHSTAN	Kazakhstan	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
ke	ken	404	KENYA	Kenya	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
ki	kir	296	KIRIBATI	Kiribati	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
kp	prk	408	KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF	Korea, Democratic People's Republic of	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
kr	kor	410	KOREA, REPUBLIC OF	Korea, Republic of	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
xk	xkx	900	KOSOVO	Kosovo	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
kw	kwt	414	KUWAIT	Kuwait	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
kg	kgz	417	KYRGYZSTAN	Kyrgyzstan	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
la	lao	418	LAO PEOPLE'S DEMOCRATIC REPUBLIC	Lao People's Democratic Republic	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
lv	lva	428	LATVIA	Latvia	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
lb	lbn	422	LEBANON	Lebanon	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
ls	lso	426	LESOTHO	Lesotho	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
lr	lbr	430	LIBERIA	Liberia	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
ly	lby	434	LIBYA	Libya	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
li	lie	438	LIECHTENSTEIN	Liechtenstein	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
lt	ltu	440	LITHUANIA	Lithuania	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
lu	lux	442	LUXEMBOURG	Luxembourg	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mo	mac	446	MACAO	Macao	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mg	mdg	450	MADAGASCAR	Madagascar	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mw	mwi	454	MALAWI	Malawi	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
my	mys	458	MALAYSIA	Malaysia	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mv	mdv	462	MALDIVES	Maldives	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
ml	mli	466	MALI	Mali	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mt	mlt	470	MALTA	Malta	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mh	mhl	584	MARSHALL ISLANDS	Marshall Islands	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mq	mtq	474	MARTINIQUE	Martinique	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mr	mrt	478	MAURITANIA	Mauritania	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mu	mus	480	MAURITIUS	Mauritius	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
yt	myt	175	MAYOTTE	Mayotte	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mx	mex	484	MEXICO	Mexico	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
fm	fsm	583	MICRONESIA, FEDERATED STATES OF	Micronesia, Federated States of	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
md	mda	498	MOLDOVA, REPUBLIC OF	Moldova, Republic of	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mc	mco	492	MONACO	Monaco	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mn	mng	496	MONGOLIA	Mongolia	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
me	mne	499	MONTENEGRO	Montenegro	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
ms	msr	500	MONTSERRAT	Montserrat	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
ma	mar	504	MOROCCO	Morocco	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mz	moz	508	MOZAMBIQUE	Mozambique	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
mm	mmr	104	MYANMAR	Myanmar	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
na	nam	516	NAMIBIA	Namibia	\N	\N	2026-07-04 13:18:12.275+00	2026-07-04 13:18:12.275+00	\N
nr	nru	520	NAURU	Nauru	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
np	npl	524	NEPAL	Nepal	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
nl	nld	528	NETHERLANDS	Netherlands	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
nc	ncl	540	NEW CALEDONIA	New Caledonia	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
nz	nzl	554	NEW ZEALAND	New Zealand	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
ni	nic	558	NICARAGUA	Nicaragua	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
ne	ner	562	NIGER	Niger	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
ng	nga	566	NIGERIA	Nigeria	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
nu	niu	570	NIUE	Niue	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
nf	nfk	574	NORFOLK ISLAND	Norfolk Island	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
mk	mkd	807	NORTH MACEDONIA	North Macedonia	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
mp	mnp	580	NORTHERN MARIANA ISLANDS	Northern Mariana Islands	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
no	nor	578	NORWAY	Norway	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
om	omn	512	OMAN	Oman	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
pk	pak	586	PAKISTAN	Pakistan	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
pw	plw	585	PALAU	Palau	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
ps	pse	275	PALESTINIAN TERRITORY, OCCUPIED	Palestinian Territory, Occupied	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
pa	pan	591	PANAMA	Panama	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
pg	png	598	PAPUA NEW GUINEA	Papua New Guinea	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
py	pry	600	PARAGUAY	Paraguay	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
pe	per	604	PERU	Peru	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
ph	phl	608	PHILIPPINES	Philippines	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
pn	pcn	612	PITCAIRN	Pitcairn	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
pl	pol	616	POLAND	Poland	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
pt	prt	620	PORTUGAL	Portugal	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
pr	pri	630	PUERTO RICO	Puerto Rico	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
qa	qat	634	QATAR	Qatar	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
re	reu	638	REUNION	Reunion	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
ro	rom	642	ROMANIA	Romania	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
ru	rus	643	RUSSIAN FEDERATION	Russian Federation	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
rw	rwa	646	RWANDA	Rwanda	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
bl	blm	652	SAINT BARTHÉLEMY	Saint Barthélemy	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
sh	shn	654	SAINT HELENA	Saint Helena	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
kn	kna	659	SAINT KITTS AND NEVIS	Saint Kitts and Nevis	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
lc	lca	662	SAINT LUCIA	Saint Lucia	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
mf	maf	663	SAINT MARTIN (FRENCH PART)	Saint Martin (French part)	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
pm	spm	666	SAINT PIERRE AND MIQUELON	Saint Pierre and Miquelon	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
vc	vct	670	SAINT VINCENT AND THE GRENADINES	Saint Vincent and the Grenadines	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
ws	wsm	882	SAMOA	Samoa	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
sm	smr	674	SAN MARINO	San Marino	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
st	stp	678	SAO TOME AND PRINCIPE	Sao Tome and Principe	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
sa	sau	682	SAUDI ARABIA	Saudi Arabia	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
sn	sen	686	SENEGAL	Senegal	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
rs	srb	688	SERBIA	Serbia	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
sc	syc	690	SEYCHELLES	Seychelles	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
sl	sle	694	SIERRA LEONE	Sierra Leone	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
sg	sgp	702	SINGAPORE	Singapore	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
sx	sxm	534	SINT MAARTEN	Sint Maarten	\N	\N	2026-07-04 13:18:12.276+00	2026-07-04 13:18:12.276+00	\N
sk	svk	703	SLOVAKIA	Slovakia	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
si	svn	705	SLOVENIA	Slovenia	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
sb	slb	090	SOLOMON ISLANDS	Solomon Islands	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
so	som	706	SOMALIA	Somalia	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
za	zaf	710	SOUTH AFRICA	South Africa	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
gs	sgs	239	SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS	South Georgia and the South Sandwich Islands	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
ss	ssd	728	SOUTH SUDAN	South Sudan	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
es	esp	724	SPAIN	Spain	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
lk	lka	144	SRI LANKA	Sri Lanka	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
sd	sdn	729	SUDAN	Sudan	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
sr	sur	740	SURINAME	Suriname	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
sj	sjm	744	SVALBARD AND JAN MAYEN	Svalbard and Jan Mayen	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
sz	swz	748	SWAZILAND	Swaziland	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
se	swe	752	SWEDEN	Sweden	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
ch	che	756	SWITZERLAND	Switzerland	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
sy	syr	760	SYRIAN ARAB REPUBLIC	Syrian Arab Republic	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
tw	twn	158	TAIWAN, PROVINCE OF CHINA	Taiwan, Province of China	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
tj	tjk	762	TAJIKISTAN	Tajikistan	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
tz	tza	834	TANZANIA, UNITED REPUBLIC OF	Tanzania, United Republic of	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
th	tha	764	THAILAND	Thailand	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
tl	tls	626	TIMOR LESTE	Timor Leste	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
tg	tgo	768	TOGO	Togo	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
tk	tkl	772	TOKELAU	Tokelau	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
to	ton	776	TONGA	Tonga	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
tt	tto	780	TRINIDAD AND TOBAGO	Trinidad and Tobago	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
tn	tun	788	TUNISIA	Tunisia	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
tr	tur	792	TURKEY	Turkey	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
tm	tkm	795	TURKMENISTAN	Turkmenistan	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
tc	tca	796	TURKS AND CAICOS ISLANDS	Turks and Caicos Islands	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
tv	tuv	798	TUVALU	Tuvalu	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
ug	uga	800	UGANDA	Uganda	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
ua	ukr	804	UKRAINE	Ukraine	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
ae	are	784	UNITED ARAB EMIRATES	United Arab Emirates	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
gb	gbr	826	UNITED KINGDOM	United Kingdom	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
us	usa	840	UNITED STATES	United States	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
um	umi	581	UNITED STATES MINOR OUTLYING ISLANDS	United States Minor Outlying Islands	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
uy	ury	858	URUGUAY	Uruguay	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
uz	uzb	860	UZBEKISTAN	Uzbekistan	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
vu	vut	548	VANUATU	Vanuatu	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
ve	ven	862	VENEZUELA	Venezuela	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
vn	vnm	704	VIET NAM	Viet Nam	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
vg	vgb	092	VIRGIN ISLANDS, BRITISH	Virgin Islands, British	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
vi	vir	850	VIRGIN ISLANDS, U.S.	Virgin Islands, U.S.	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
wf	wlf	876	WALLIS AND FUTUNA	Wallis and Futuna	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
eh	esh	732	WESTERN SAHARA	Western Sahara	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
ye	yem	887	YEMEN	Yemen	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
zm	zmb	894	ZAMBIA	Zambia	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
zw	zwe	716	ZIMBABWE	Zimbabwe	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
ax	ala	248	ÅLAND ISLANDS	Åland Islands	\N	\N	2026-07-04 13:18:12.277+00	2026-07-04 13:18:12.277+00	\N
ir	irn	364	IRAN, ISLAMIC REPUBLIC OF	Iran, Islamic Republic of	reg_01KWPMF6JRM4THSDMV3YPVPFQB	\N	2026-07-04 13:18:12.274+00	2026-07-04 13:18:15.155+00	\N
\.


--
-- Data for Name: region_payment_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.region_payment_provider (region_id, payment_provider_id, id, created_at, updated_at, deleted_at) FROM stdin;
reg_01KWPMF6JRM4THSDMV3YPVPFQB	pp_system_default	regpp_01KWPMF6NPJCQ1VJ3K0A5G543X	2026-07-04 13:18:15.219196+00	2026-07-04 13:18:15.219196+00	\N
reg_01KWPMF6JRM4THSDMV3YPVPFQB	pp_behpardakht_behpardakht	regpp_01KWPMF6NQ6V8J4FFYDQ3KM0R9	2026-07-04 13:18:15.219196+00	2026-07-04 13:18:15.219196+00	\N
\.


--
-- Data for Name: renewal_attempt; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.renewal_attempt (id, renewal_cycle_id, attempt_no, started_at, finished_at, status, error_code, error_message, payment_reference, order_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: renewal_cycle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.renewal_cycle (id, subscription_id, scheduled_for, processed_at, status, approval_required, approval_status, approval_decided_at, approval_decided_by, approval_reason, generated_order_id, applied_pending_update_data, last_error, attempt_count, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: renewal_renewal_cycle_order_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.renewal_renewal_cycle_order_order (renewal_cycle_id, order_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: reservation_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservation_item (id, created_at, updated_at, deleted_at, line_item_id, location_id, quantity, external_id, description, created_by, metadata, inventory_item_id, allow_backorder, raw_quantity) FROM stdin;
\.


--
-- Data for Name: retention_offer_event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.retention_offer_event (id, cancellation_case_id, offer_type, offer_payload, decision_status, decision_reason, decided_at, decided_by, applied_at, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: return; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return (id, order_id, claim_id, exchange_id, order_version, display_id, status, no_notification, refund_amount, raw_refund_amount, metadata, created_at, updated_at, deleted_at, received_at, canceled_at, location_id, requested_at, created_by) FROM stdin;
\.


--
-- Data for Name: return_fulfillment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_fulfillment (return_id, fulfillment_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: return_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_item (id, return_id, reason_id, item_id, quantity, raw_quantity, received_quantity, raw_received_quantity, note, metadata, created_at, updated_at, deleted_at, damaged_quantity, raw_damaged_quantity) FROM stdin;
\.


--
-- Data for Name: return_reason; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_reason (id, value, label, description, metadata, parent_return_reason_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: sales_channel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_channel (id, name, description, is_disabled, metadata, created_at, updated_at, deleted_at) FROM stdin;
sc_01KWPMF6BKBEKVPCKB7BSFK1AE	فروشگاه اینترنتی		f	\N	2026-07-04 13:18:14.9+00	2026-07-08 20:02:04.71+00	\N
\.


--
-- Data for Name: sales_channel_stock_location; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_channel_stock_location (sales_channel_id, stock_location_id, id, created_at, updated_at, deleted_at) FROM stdin;
sc_01KWPMF6BKBEKVPCKB7BSFK1AE	sloc_01KWPMF6RPFEZRNYVPD3NEDRTB	scloc_01KWPMF77NH84AMHRC7SC85PQ9	2026-07-04 13:18:15.796399+00	2026-07-04 13:18:15.796399+00	\N
sc_01KWPMF6BKBEKVPCKB7BSFK1AE	sloc_01KX2X6FCT3F7S0B8SNN7PQJDB	scloc_01KX2XMT243R72TJRDASJE4F9M	2026-07-09 07:49:29.282325+00	2026-07-09 07:49:29.282325+00	\N
\.


--
-- Data for Name: script_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.script_migrations (id, script_name, created_at, finished_at) FROM stdin;
1	migrate-normalize-currency-codes-normalization.js	2026-07-04 13:18:14.542645+00	2026-07-04 13:18:14.655799+00
2	migrate-product-option-link-ids.js	2026-07-04 13:18:14.665877+00	2026-07-04 13:18:14.68354+00
3	migrate-product-shipping-profile.js	2026-07-04 13:18:14.696546+00	2026-07-04 13:18:14.77359+00
4	migrate-tax-region-provider.js	2026-07-04 13:18:14.79732+00	2026-07-04 13:18:14.829224+00
5	reconcile-inventory-reserved-quantity.js	2026-07-04 13:18:14.841237+00	2026-07-04 13:18:14.865343+00
\.


--
-- Data for Name: service_zone; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_zone (id, name, metadata, fulfillment_set_id, created_at, updated_at, deleted_at) FROM stdin;
serzo_01KWPMF6VY06FHGR56099MR95Y	Iran	\N	fuset_01KWPMF6VYP7C9E5QDXZN87ZZN	2026-07-04 13:18:15.424+00	2026-07-04 13:18:15.424+00	\N
serzo_01KX2X8HDCMKJS2HW5QKBHGGC7	داخل استان	\N	fuset_01KX2X7H94CS9DB34C9C566KGG	2026-07-09 07:42:47.214+00	2026-07-09 07:42:47.214+00	\N
serzo_01KX2XW7QMSVGESYCT520WDG7J	کل ایران	\N	fuset_01KX2XVKC7NW7SCMWZEY1D9DDV	2026-07-09 07:53:32.661+00	2026-07-09 07:55:25.322+00	2026-07-09 07:55:25.32+00
serzo_01KX2Y0P6KRVWQR3SQT8J9XTSJ	ایران	\N	fuset_01KX2XVKC7NW7SCMWZEY1D9DDV	2026-07-09 07:55:58.547+00	2026-07-09 07:59:39.879+00	\N
\.


--
-- Data for Name: shipping_option; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_option (id, name, price_type, service_zone_id, shipping_profile_id, provider_id, data, metadata, shipping_option_type_id, created_at, updated_at, deleted_at) FROM stdin;
so_01KWPMF71AVYFH2V3DWAHHS4AW	پست عادی	flat	serzo_01KWPMF6VY06FHGR56099MR95Y	sp_01KWPMF66TGSY6ZBG4K8BQ6MNP	manual_manual	\N	\N	sotype_01KWPMF717QF446GEPNYSAZ5NP	2026-07-04 13:18:15.598+00	2026-07-04 13:18:15.598+00	\N
so_01KWPMF71CF50XNP7GT7YYQ770	پست پیشتاز	flat	serzo_01KWPMF6VY06FHGR56099MR95Y	sp_01KWPMF66TGSY6ZBG4K8BQ6MNP	manual_manual	\N	\N	sotype_01KWPMF71A4X4MXCZ1KW1CWVEZ	2026-07-04 13:18:15.599+00	2026-07-04 13:18:15.599+00	\N
so_01KX2XX8FBX5SH49W0GHX9BMEH	تحویل حضوری	flat	serzo_01KX2XW7QMSVGESYCT520WDG7J	sp_01KX2X561R7XT7FWKJP16G9G4F	manual_manual	{"id": "manual-fulfillment"}	\N	sotype_01KWPMF71A4X4MXCZ1KW1CWVEZ	2026-07-09 07:54:06.188+00	2026-07-09 07:55:25.338+00	2026-07-09 07:55:25.32+00
so_01KX2Y6TYYXNW9QNJXJ1H916XZ	تحویل حضوری	flat	serzo_01KX2Y0P6KRVWQR3SQT8J9XTSJ	sp_01KX2X561R7XT7FWKJP16G9G4F	manual_manual	{"id": "manual-fulfillment"}	\N	sotype_01KX2WYW5TG9QE3H4708BDQJZD	2026-07-09 07:59:20.032+00	2026-07-09 07:59:20.032+00	\N
\.


--
-- Data for Name: shipping_option_price_set; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_option_price_set (shipping_option_id, price_set_id, id, created_at, updated_at, deleted_at) FROM stdin;
so_01KWPMF71AVYFH2V3DWAHHS4AW	pset_01KWPMF7398XRAA35GF4MEDD4Q	sops_01KWPMF763PPBH9CHPNAHWNKNP	2026-07-04 13:18:15.746624+00	2026-07-04 13:18:15.746624+00	\N
so_01KWPMF71CF50XNP7GT7YYQ770	pset_01KWPMF73B6RYQERHDSM6X5AN2	sops_01KWPMF765GNVMCRBG8287XDPW	2026-07-04 13:18:15.746624+00	2026-07-04 13:18:15.746624+00	\N
so_01KX2XX8FBX5SH49W0GHX9BMEH	pset_01KX2XX8H1DBDF260PJG6BE6CV	sops_01KX2XX8KG7450CMNC7Y9NNPKR	2026-07-09 07:54:06.318172+00	2026-07-09 07:54:06.318172+00	\N
so_01KX2Y6TYYXNW9QNJXJ1H916XZ	pset_01KX2Y6V059RK921J65KQ5BWWZ	sops_01KX2Y6V1MD55BHRZKSTF730MN	2026-07-09 07:59:20.115831+00	2026-07-09 07:59:20.115831+00	\N
\.


--
-- Data for Name: shipping_option_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_option_rule (id, attribute, operator, value, shipping_option_id, created_at, updated_at, deleted_at) FROM stdin;
sorul_01KWPMF718DSMNMDHYAKVG1F5C	enabled_in_store	eq	"true"	so_01KWPMF71AVYFH2V3DWAHHS4AW	2026-07-04 13:18:15.6+00	2026-07-04 13:18:15.6+00	\N
sorul_01KWPMF719SFSYVSE58XMD0T2X	is_return	eq	"false"	so_01KWPMF71AVYFH2V3DWAHHS4AW	2026-07-04 13:18:15.6+00	2026-07-04 13:18:15.6+00	\N
sorul_01KWPMF71B98EXZFM1YKSJKJZW	enabled_in_store	eq	"true"	so_01KWPMF71CF50XNP7GT7YYQ770	2026-07-04 13:18:15.6+00	2026-07-04 13:18:15.6+00	\N
sorul_01KWPMF71BN6G0975APAW9G8FB	is_return	eq	"false"	so_01KWPMF71CF50XNP7GT7YYQ770	2026-07-04 13:18:15.601+00	2026-07-04 13:18:15.601+00	\N
sorul_01KX2XX8FAJP4M85A6DFAAPEZS	is_return	eq	"false"	so_01KX2XX8FBX5SH49W0GHX9BMEH	2026-07-09 07:54:06.189+00	2026-07-09 07:55:25.358+00	2026-07-09 07:55:25.32+00
sorul_01KX2XX8FBS0DZ93F02PXNEHVF	enabled_in_store	eq	"true"	so_01KX2XX8FBX5SH49W0GHX9BMEH	2026-07-09 07:54:06.19+00	2026-07-09 07:55:25.358+00	2026-07-09 07:55:25.32+00
sorul_01KX2Y6TYXG0Z8GHSR2XHQGX0P	is_return	eq	"false"	so_01KX2Y6TYYXNW9QNJXJ1H916XZ	2026-07-09 07:59:20.032+00	2026-07-09 07:59:20.032+00	\N
sorul_01KX2Y6TYYQQB8MHWBJM2FGS1W	enabled_in_store	eq	"true"	so_01KX2Y6TYYXNW9QNJXJ1H916XZ	2026-07-09 07:59:20.032+00	2026-07-09 07:59:20.032+00	\N
\.


--
-- Data for Name: shipping_option_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_option_type (id, label, description, code, created_at, updated_at, deleted_at) FROM stdin;
sotype_01KX2WYW5TG9QE3H4708BDQJZD	تحویل حضوری	کالاهای بسیار بزرگ	physical delivery	2026-07-09 07:37:30.555+00	2026-07-09 07:38:24.781+00	\N
sotype_01KWPMF717QF446GEPNYSAZ5NP	پست عادی	ارسال در ۲ تا ۳ روز.	standard	2026-07-04 13:18:15.597+00	2026-07-09 07:38:53.914+00	\N
sotype_01KX2X1Y98RXM14N2P6WDF47KS	تیپاکس	\N	tipax	2026-07-09 07:39:11.016+00	2026-07-09 07:39:11.016+00	\N
sotype_01KWPMF71A4X4MXCZ1KW1CWVEZ	پست پیشتاز	ارسال در ۲۴ ساعت.	express	2026-07-04 13:18:15.598+00	2026-07-09 07:39:31.694+00	\N
\.


--
-- Data for Name: shipping_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_profile (id, name, type, metadata, created_at, updated_at, deleted_at) FROM stdin;
sp_01KWPMF66TGSY6ZBG4K8BQ6MNP	Default Shipping Profile	default	\N	2026-07-04 13:18:14.747+00	2026-07-04 13:18:14.747+00	\N
sp_01KX2X4AT0B192TBXFVQW1CKPP	پست پیشتاز	کالاهای عادی	\N	2026-07-09 07:40:29.377+00	2026-07-09 07:40:29.377+00	\N
sp_01KX2X561R7XT7FWKJP16G9G4F	تحویل حضوری	کالاهای بسیار حجیم	\N	2026-07-09 07:40:57.272+00	2026-07-09 07:40:57.272+00	\N
\.


--
-- Data for Name: stock_location; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_location (id, created_at, updated_at, deleted_at, name, address_id, metadata) FROM stdin;
sloc_01KWPMF6RPFEZRNYVPD3NEDRTB	2026-07-04 13:18:15.32+00	2026-07-04 13:18:15.32+00	\N	انبار اصفهان	laddr_01KWPMF6RNC80KNK286QY8SD65	\N
sloc_01KX2X6FCT3F7S0B8SNN7PQJDB	2026-07-09 07:41:39.611+00	2026-07-09 07:41:39.611+00	\N	انبار دهاقان	laddr_01KX2X6FCSARE8F7W0BCWZACQ0	\N
sloc_01KXAPD8WR0BJMB5NVCPX41V5Q	2026-07-12 08:16:57.753+00	2026-07-12 08:17:06.425+00	2026-07-12 08:17:06.424+00	انبار مرکزی	laddr_01KXAPD8WQZ1B8H7B28FPCWDXN	\N
\.


--
-- Data for Name: stock_location_address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_location_address (id, created_at, updated_at, deleted_at, address_1, address_2, company, city, country_code, phone, province, postal_code, metadata) FROM stdin;
laddr_01KWPMF6RNC80KNK286QY8SD65	2026-07-04 13:18:15.319+00	2026-07-04 13:18:15.319+00	\N		\N	\N	Isfahan	IR	\N	\N	\N	\N
laddr_01KX2X6FCSARE8F7W0BCWZACQ0	2026-07-09 07:41:39.611+00	2026-07-09 07:41:39.611+00	\N	دهاقان				ir				\N
laddr_01KXAPD8WQZ1B8H7B28FPCWDXN	2026-07-12 08:16:57.753+00	2026-07-12 08:17:06.438+00	2026-07-12 08:17:06.424+00	شسیبشسیب				ir				\N
\.


--
-- Data for Name: stock_location_stock_location_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_location_stock_location_store_store (stock_location_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
sloc_01KWPMF6RPFEZRNYVPD3NEDRTB	store_01KWPMF6G1H0CEKN2BF32F0B2M	link_01KWPMF6SWNXM3ZPD386Z7R0XQ	2026-07-04 13:18:15.355285+00	2026-07-04 13:18:15.355285+00	\N
sloc_01KX2X6FCT3F7S0B8SNN7PQJDB	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KX2X6FDR8QG92QBR9FZ6CQRJ	2026-07-09 07:41:39.640135+00	2026-07-09 07:41:39.640135+00	\N
sloc_01KXAPD8WR0BJMB5NVCPX41V5Q	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KXAPD8XVQ1R3PDH4SAB828CN	2026-07-12 08:16:57.786898+00	2026-07-12 08:17:06.48+00	2026-07-12 08:17:06.477+00
\.


--
-- Data for Name: store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store (id, name, default_sales_channel_id, default_region_id, default_location_id, metadata, created_at, updated_at, deleted_at) FROM stdin;
store_01KWPMF6G1H0CEKN2BF32F0B2M	فروشگاه پیش‌فرض	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	\N	\N	\N	2026-07-04 13:18:15.035081+00	2026-07-04 13:18:15.035081+00	\N
store_01KX1MP5CVCT65E2J2C934N6V9	تابش الکتریک	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	reg_01KWPMF6JRM4THSDMV3YPVPFQB	\N	\N	2026-07-08 19:53:42.03769+00	2026-07-08 19:53:42.03769+00	\N
store_01KWQ6ZR936J01M44Q7DXT1FT5	SUPER ADMIN STORE	sc_01KWPMF6BKBEKVPCKB7BSFK1AE	reg_01KWPMF6JRM4THSDMV3YPVPFQB	\N	\N	2026-07-04 18:41:51.901294+00	2026-07-04 18:41:51.901294+00	\N
\.


--
-- Data for Name: store_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_config (id, medusa_store_id, title, handle, domain, description, logo_url, logo_alt, favicon_url, homepage_layout, about_page_layout, seo_config, marketing_config, config, subscription_product_id, subscription_status, created_at, updated_at, deleted_at, theme, theme_overrides, payment_configs, shipping_method_configs, puck_data) FROM stdin;
\.


--
-- Data for Name: store_currency; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_currency (id, currency_code, is_default, store_id, created_at, updated_at, deleted_at) FROM stdin;
stocur_01KWPMF6GEAZ5172ZT6A1ZAM06	irr	t	store_01KWPMF6G1H0CEKN2BF32F0B2M	2026-07-04 13:18:15.035081+00	2026-07-04 13:18:15.035081+00	\N
stocur_01KX1MWCJ7D40JQDPWJRY0XZHF	irr	t	store_01KX1MP5CVCT65E2J2C934N6V9	2026-07-08 19:57:05.984899+00	2026-07-08 19:57:05.984899+00	\N
stocur_01KX1N3WET903RJCSY3MHGSAKT	irr	t	store_01KWQ6ZR936J01M44Q7DXT1FT5	2026-07-08 20:01:11.634072+00	2026-07-08 20:01:11.634072+00	\N
\.


--
-- Data for Name: store_locale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_locale (id, locale_code, store_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: storeconfigmodule_store_config_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storeconfigmodule_store_config_store_store (store_config_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription (id, reference, status, customer_id, product_id, variant_id, frequency_interval, frequency_value, started_at, next_renewal_at, last_renewal_at, paused_at, cancelled_at, cancel_effective_at, skip_next_cycle, is_trial, trial_ends_at, customer_snapshot, product_snapshot, pricing_snapshot, shipping_address, pending_update_data, metadata, created_at, updated_at, deleted_at, cart_id, payment_context) FROM stdin;
\.


--
-- Data for Name: subscription_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_log (id, subscription_id, customer_id, event_type, actor_type, actor_id, subscription_reference, customer_name, product_title, variant_title, reason, dedupe_key, previous_state, new_state, changed_fields, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: subscription_metrics_daily; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_metrics_daily (id, metric_date, subscription_id, customer_id, product_id, variant_id, status, frequency_interval, frequency_value, currency_code, is_active, active_subscriptions_count, mrr_amount, churned_subscriptions_count, churn_reason_category, source_snapshot, metadata, raw_mrr_amount, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: subscription_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_settings (id, settings_key, default_trial_days, dunning_retry_intervals, max_dunning_attempts, default_renewal_behavior, default_cancellation_behavior, version, updated_by, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: subscription_subscription_cancellation_cancellation_case; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_subscription_cancellation_cancellation_case (subscription_id, cancellation_case_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: subscription_subscription_cart_cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_subscription_cart_cart (subscription_id, cart_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: subscription_subscription_customer_customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_subscription_customer_customer (subscription_id, customer_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: subscription_subscription_order_order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_subscription_order_order (subscription_id, order_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: subscription_subscription_product_product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_subscription_product_product (subscription_id, product_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: subscription_subscription_product_product_variant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_subscription_product_product_variant (subscription_id, product_variant_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: subscription_subscription_renewal_renewal_cycle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_subscription_renewal_renewal_cycle (subscription_id, renewal_cycle_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: super_admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.super_admin (id, created_at, updated_at, deleted_at) FROM stdin;
01KWQ6ZRS68D8ZNRPXVSPFN7S8	2026-07-04 18:41:52.423+00	2026-07-04 18:41:52.423+00	\N
\.


--
-- Data for Name: tax_provider; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_provider (id, is_enabled, created_at, updated_at, deleted_at) FROM stdin;
tp_system	t	2026-07-04 13:18:12.642+00	2026-07-04 13:18:12.642+00	\N
\.


--
-- Data for Name: tax_rate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_rate (id, rate, code, name, is_default, is_combinable, tax_region_id, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: tax_rate_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_rate_rule (id, tax_rate_id, reference_id, reference, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: tax_region; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_region (id, provider_id, country_code, province_code, parent_id, metadata, created_at, updated_at, created_by, deleted_at) FROM stdin;
txreg_01KWPMF6Q9G33T518G90X5TNMQ	tp_system	ir	\N	\N	\N	2026-07-04 13:18:15.274+00	2026-07-04 13:18:15.274+00	\N	\N
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, first_name, last_name, email, avatar_url, metadata, created_at, updated_at, deleted_at) FROM stdin;
user_01KWPMHWGH240NRX0KYCEBYRC5	\N	\N	sayeyesepidar@gmail.com	\N	\N	2026-07-04 13:19:43.122+00	2026-07-04 13:19:43.122+00	\N
user_01KWQ6ZQRF7AWZB0H21RNGA8EV			superadmin@liasa.com	\N	{}	2026-07-04 18:41:51.377+00	2026-07-08 18:23:14.039+00	\N
user_01KX1MP50N2JHQWREQHZSRKN22	محسن	یوسفپور	tabeshelecshop@gmail.com	\N	{}	2026-07-08 19:53:41.654+00	2026-07-08 19:58:07.813+00	\N
\.


--
-- Data for Name: user_preference; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_preference (id, user_id, key, value, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: user_rbac_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_rbac_role (user_id, rbac_role_id, id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: user_user_store_store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_user_store_store (user_id, store_id, id, created_at, updated_at, deleted_at) FROM stdin;
user_01KX1MP50N2JHQWREQHZSRKN22	store_01KX1MP5CVCT65E2J2C934N6V9	link_01KX1MP5F16VJEG96C8GMD3R8Z	2026-07-08 19:53:42.110313+00	2026-07-08 19:53:42.110313+00	\N
\.


--
-- Data for Name: user_user_super_admin_super_admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_user_super_admin_super_admin (user_id, super_admin_id, id, created_at, updated_at, deleted_at) FROM stdin;
user_01KWQ6ZQRF7AWZB0H21RNGA8EV	01KWQ6ZRS68D8ZNRPXVSPFN7S8	link_01KWQ6ZRSYWJAVQWPJNV62ERVT	2026-07-04 18:41:52.445877+00	2026-07-04 18:41:52.445877+00	\N
\.


--
-- Data for Name: view_configuration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.view_configuration (id, entity, name, user_id, is_system_default, configuration, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: workflow_execution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_execution (id, workflow_id, transaction_id, execution, context, state, created_at, updated_at, deleted_at, retention_time, run_id) FROM stdin;
\.


--
-- Name: link_module_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.link_module_migrations_id_seq', 131, true);


--
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mikro_orm_migrations_id_seq', 196, true);


--
-- Name: order_change_action_ordering_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_change_action_ordering_seq', 1, false);


--
-- Name: order_claim_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_claim_display_id_seq', 1, false);


--
-- Name: order_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_display_id_seq', 1, false);


--
-- Name: order_exchange_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_exchange_display_id_seq', 1, false);


--
-- Name: return_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.return_display_id_seq', 1, false);


--
-- Name: script_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.script_migrations_id_seq', 6, true);


--
-- Name: account_holder account_holder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_holder
    ADD CONSTRAINT account_holder_pkey PRIMARY KEY (id);


--
-- Name: api_key_api_key_store_store api_key_api_key_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_key_api_key_store_store
    ADD CONSTRAINT api_key_api_key_store_store_pkey PRIMARY KEY (api_key_id, store_id);


--
-- Name: api_key api_key_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_key
    ADD CONSTRAINT api_key_pkey PRIMARY KEY (id);


--
-- Name: application_method_buy_rules application_method_buy_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_method_buy_rules
    ADD CONSTRAINT application_method_buy_rules_pkey PRIMARY KEY (application_method_id, promotion_rule_id);


--
-- Name: application_method_target_rules application_method_target_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_method_target_rules
    ADD CONSTRAINT application_method_target_rules_pkey PRIMARY KEY (application_method_id, promotion_rule_id);


--
-- Name: auth_identity auth_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_identity
    ADD CONSTRAINT auth_identity_pkey PRIMARY KEY (id);


--
-- Name: auth_mfa_factor auth_mfa_factor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_mfa_factor
    ADD CONSTRAINT auth_mfa_factor_pkey PRIMARY KEY (id);


--
-- Name: auth_mfa_recovery_code auth_mfa_recovery_code_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_mfa_recovery_code
    ADD CONSTRAINT auth_mfa_recovery_code_pkey PRIMARY KEY (id);


--
-- Name: auth_password_reset_token auth_password_reset_token_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_password_reset_token
    ADD CONSTRAINT auth_password_reset_token_pkey PRIMARY KEY (id);


--
-- Name: auth_verification auth_verification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_verification
    ADD CONSTRAINT auth_verification_pkey PRIMARY KEY (id);


--
-- Name: cancellation_case cancellation_case_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancellation_case
    ADD CONSTRAINT cancellation_case_pkey PRIMARY KEY (id);


--
-- Name: capture capture_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capture
    ADD CONSTRAINT capture_pkey PRIMARY KEY (id);


--
-- Name: cart_address cart_address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_address
    ADD CONSTRAINT cart_address_pkey PRIMARY KEY (id);


--
-- Name: cart_line_item_adjustment cart_line_item_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_line_item_adjustment
    ADD CONSTRAINT cart_line_item_adjustment_pkey PRIMARY KEY (id);


--
-- Name: cart_line_item cart_line_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_line_item
    ADD CONSTRAINT cart_line_item_pkey PRIMARY KEY (id);


--
-- Name: cart_line_item_tax_line cart_line_item_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_line_item_tax_line
    ADD CONSTRAINT cart_line_item_tax_line_pkey PRIMARY KEY (id);


--
-- Name: cart_payment_collection cart_payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_payment_collection
    ADD CONSTRAINT cart_payment_collection_pkey PRIMARY KEY (cart_id, payment_collection_id);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- Name: cart_promotion cart_promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_promotion
    ADD CONSTRAINT cart_promotion_pkey PRIMARY KEY (cart_id, promotion_id);


--
-- Name: cart_shipping_method_adjustment cart_shipping_method_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_shipping_method_adjustment
    ADD CONSTRAINT cart_shipping_method_adjustment_pkey PRIMARY KEY (id);


--
-- Name: cart_shipping_method cart_shipping_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_shipping_method
    ADD CONSTRAINT cart_shipping_method_pkey PRIMARY KEY (id);


--
-- Name: cart_shipping_method_tax_line cart_shipping_method_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_shipping_method_tax_line
    ADD CONSTRAINT cart_shipping_method_tax_line_pkey PRIMARY KEY (id);


--
-- Name: credit_line credit_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_line
    ADD CONSTRAINT credit_line_pkey PRIMARY KEY (id);


--
-- Name: currency currency_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency
    ADD CONSTRAINT currency_pkey PRIMARY KEY (code);


--
-- Name: customer_account_holder customer_account_holder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_account_holder
    ADD CONSTRAINT customer_account_holder_pkey PRIMARY KEY (customer_id, account_holder_id);


--
-- Name: customer_address customer_address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_address
    ADD CONSTRAINT customer_address_pkey PRIMARY KEY (id);


--
-- Name: customer_customer_sales_channel_sales_channel customer_customer_sales_channel_sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_customer_sales_channel_sales_channel
    ADD CONSTRAINT customer_customer_sales_channel_sales_channel_pkey PRIMARY KEY (customer_id, sales_channel_id);


--
-- Name: customer_customer_store_store customer_customer_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_customer_store_store
    ADD CONSTRAINT customer_customer_store_store_pkey PRIMARY KEY (customer_id, store_id);


--
-- Name: customer_group_customer customer_group_customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_group_customer
    ADD CONSTRAINT customer_group_customer_pkey PRIMARY KEY (id);


--
-- Name: customer_group customer_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_group
    ADD CONSTRAINT customer_group_pkey PRIMARY KEY (id);


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: dunning_attempt dunning_attempt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dunning_attempt
    ADD CONSTRAINT dunning_attempt_pkey PRIMARY KEY (id);


--
-- Name: dunning_case dunning_case_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dunning_case
    ADD CONSTRAINT dunning_case_pkey PRIMARY KEY (id);


--
-- Name: fulfillment_address fulfillment_address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_address
    ADD CONSTRAINT fulfillment_address_pkey PRIMARY KEY (id);


--
-- Name: fulfillment_item fulfillment_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_item
    ADD CONSTRAINT fulfillment_item_pkey PRIMARY KEY (id);


--
-- Name: fulfillment_label fulfillment_label_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_label
    ADD CONSTRAINT fulfillment_label_pkey PRIMARY KEY (id);


--
-- Name: fulfillment fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_pkey PRIMARY KEY (id);


--
-- Name: fulfillment_provider fulfillment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_provider
    ADD CONSTRAINT fulfillment_provider_pkey PRIMARY KEY (id);


--
-- Name: fulfillment_set fulfillment_set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_set
    ADD CONSTRAINT fulfillment_set_pkey PRIMARY KEY (id);


--
-- Name: fulfillment_shipping_profile_store_store fulfillment_shipping_profile_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_shipping_profile_store_store
    ADD CONSTRAINT fulfillment_shipping_profile_store_store_pkey PRIMARY KEY (shipping_profile_id, store_id);


--
-- Name: geo_zone geo_zone_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.geo_zone
    ADD CONSTRAINT geo_zone_pkey PRIMARY KEY (id);


--
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- Name: inventory_item inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_item
    ADD CONSTRAINT inventory_item_pkey PRIMARY KEY (id);


--
-- Name: inventory_level inventory_level_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_level
    ADD CONSTRAINT inventory_level_pkey PRIMARY KEY (id);


--
-- Name: invite invite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite
    ADD CONSTRAINT invite_pkey PRIMARY KEY (id);


--
-- Name: invite_rbac_role invite_rbac_role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invite_rbac_role
    ADD CONSTRAINT invite_rbac_role_pkey PRIMARY KEY (invite_id, rbac_role_id);


--
-- Name: link_module_migrations link_module_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link_module_migrations
    ADD CONSTRAINT link_module_migrations_pkey PRIMARY KEY (id);


--
-- Name: link_module_migrations link_module_migrations_table_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.link_module_migrations
    ADD CONSTRAINT link_module_migrations_table_name_key UNIQUE (table_name);


--
-- Name: location_fulfillment_provider location_fulfillment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_fulfillment_provider
    ADD CONSTRAINT location_fulfillment_provider_pkey PRIMARY KEY (stock_location_id, fulfillment_provider_id);


--
-- Name: location_fulfillment_set location_fulfillment_set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_fulfillment_set
    ADD CONSTRAINT location_fulfillment_set_pkey PRIMARY KEY (stock_location_id, fulfillment_set_id);


--
-- Name: mikro_orm_migrations mikro_orm_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mikro_orm_migrations
    ADD CONSTRAINT mikro_orm_migrations_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: notification_provider notification_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_provider
    ADD CONSTRAINT notification_provider_pkey PRIMARY KEY (id);


--
-- Name: order_address order_address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_address
    ADD CONSTRAINT order_address_pkey PRIMARY KEY (id);


--
-- Name: order_cart order_cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_cart
    ADD CONSTRAINT order_cart_pkey PRIMARY KEY (order_id, cart_id);


--
-- Name: order_change_action order_change_action_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_change_action
    ADD CONSTRAINT order_change_action_pkey PRIMARY KEY (id);


--
-- Name: order_change order_change_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_change
    ADD CONSTRAINT order_change_pkey PRIMARY KEY (id);


--
-- Name: order_claim_item_image order_claim_item_image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_claim_item_image
    ADD CONSTRAINT order_claim_item_image_pkey PRIMARY KEY (id);


--
-- Name: order_claim_item order_claim_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_claim_item
    ADD CONSTRAINT order_claim_item_pkey PRIMARY KEY (id);


--
-- Name: order_claim order_claim_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_claim
    ADD CONSTRAINT order_claim_pkey PRIMARY KEY (id);


--
-- Name: order_credit_line order_credit_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_credit_line
    ADD CONSTRAINT order_credit_line_pkey PRIMARY KEY (id);


--
-- Name: order_exchange_item order_exchange_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_exchange_item
    ADD CONSTRAINT order_exchange_item_pkey PRIMARY KEY (id);


--
-- Name: order_exchange order_exchange_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_exchange
    ADD CONSTRAINT order_exchange_pkey PRIMARY KEY (id);


--
-- Name: order_fulfillment order_fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_fulfillment
    ADD CONSTRAINT order_fulfillment_pkey PRIMARY KEY (order_id, fulfillment_id);


--
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (id);


--
-- Name: order_line_item_adjustment order_line_item_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_line_item_adjustment
    ADD CONSTRAINT order_line_item_adjustment_pkey PRIMARY KEY (id);


--
-- Name: order_line_item order_line_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_line_item
    ADD CONSTRAINT order_line_item_pkey PRIMARY KEY (id);


--
-- Name: order_line_item_tax_line order_line_item_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_line_item_tax_line
    ADD CONSTRAINT order_line_item_tax_line_pkey PRIMARY KEY (id);


--
-- Name: order_order_store_store order_order_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_order_store_store
    ADD CONSTRAINT order_order_store_store_pkey PRIMARY KEY (order_id, store_id);


--
-- Name: order_payment_collection order_payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_payment_collection
    ADD CONSTRAINT order_payment_collection_pkey PRIMARY KEY (order_id, payment_collection_id);


--
-- Name: order order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);


--
-- Name: order_promotion order_promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_promotion
    ADD CONSTRAINT order_promotion_pkey PRIMARY KEY (order_id, promotion_id);


--
-- Name: order_shipping_method_adjustment order_shipping_method_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping_method_adjustment
    ADD CONSTRAINT order_shipping_method_adjustment_pkey PRIMARY KEY (id);


--
-- Name: order_shipping_method order_shipping_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping_method
    ADD CONSTRAINT order_shipping_method_pkey PRIMARY KEY (id);


--
-- Name: order_shipping_method_tax_line order_shipping_method_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping_method_tax_line
    ADD CONSTRAINT order_shipping_method_tax_line_pkey PRIMARY KEY (id);


--
-- Name: order_shipping order_shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_pkey PRIMARY KEY (id);


--
-- Name: order_summary order_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_summary
    ADD CONSTRAINT order_summary_pkey PRIMARY KEY (id);


--
-- Name: order_transaction order_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_transaction
    ADD CONSTRAINT order_transaction_pkey PRIMARY KEY (id);


--
-- Name: payment_collection_payment_providers payment_collection_payment_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_collection_payment_providers
    ADD CONSTRAINT payment_collection_payment_providers_pkey PRIMARY KEY (payment_collection_id, payment_provider_id);


--
-- Name: payment_collection payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_collection
    ADD CONSTRAINT payment_collection_pkey PRIMARY KEY (id);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- Name: payment_provider payment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_provider
    ADD CONSTRAINT payment_provider_pkey PRIMARY KEY (id);


--
-- Name: payment_session payment_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_session
    ADD CONSTRAINT payment_session_pkey PRIMARY KEY (id);


--
-- Name: plan_offer plan_offer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plan_offer
    ADD CONSTRAINT plan_offer_pkey PRIMARY KEY (id);


--
-- Name: price_list price_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list
    ADD CONSTRAINT price_list_pkey PRIMARY KEY (id);


--
-- Name: price_list_rule price_list_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list_rule
    ADD CONSTRAINT price_list_rule_pkey PRIMARY KEY (id);


--
-- Name: price price_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_pkey PRIMARY KEY (id);


--
-- Name: price_preference price_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_preference
    ADD CONSTRAINT price_preference_pkey PRIMARY KEY (id);


--
-- Name: price_rule price_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_rule
    ADD CONSTRAINT price_rule_pkey PRIMARY KEY (id);


--
-- Name: price_set price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_set
    ADD CONSTRAINT price_set_pkey PRIMARY KEY (id);


--
-- Name: pricing_price_list_store_store pricing_price_list_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_price_list_store_store
    ADD CONSTRAINT pricing_price_list_store_store_pkey PRIMARY KEY (price_list_id, store_id);


--
-- Name: product_category_image product_category_image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category_image
    ADD CONSTRAINT product_category_image_pkey PRIMARY KEY (id);


--
-- Name: product_category product_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_pkey PRIMARY KEY (id);


--
-- Name: product_category_product product_category_product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category_product
    ADD CONSTRAINT product_category_product_pkey PRIMARY KEY (product_id, product_category_id);


--
-- Name: product_collection product_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_collection
    ADD CONSTRAINT product_collection_pkey PRIMARY KEY (id);


--
-- Name: product_option product_option_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option
    ADD CONSTRAINT product_option_pkey PRIMARY KEY (id);


--
-- Name: product_option_value product_option_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_value
    ADD CONSTRAINT product_option_value_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: product_product_category_store_store product_product_category_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_product_category_store_store
    ADD CONSTRAINT product_product_category_store_store_pkey PRIMARY KEY (product_category_id, store_id);


--
-- Name: product_product_collection_store_store product_product_collection_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_product_collection_store_store
    ADD CONSTRAINT product_product_collection_store_store_pkey PRIMARY KEY (product_collection_id, store_id);


--
-- Name: product_product_option product_product_option_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_product_option
    ADD CONSTRAINT product_product_option_pkey PRIMARY KEY (id);


--
-- Name: product_product_option_store_store product_product_option_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_product_option_store_store
    ADD CONSTRAINT product_product_option_store_store_pkey PRIMARY KEY (product_option_id, store_id);


--
-- Name: product_product_option_value product_product_option_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_product_option_value
    ADD CONSTRAINT product_product_option_value_pkey PRIMARY KEY (id);


--
-- Name: product_product_store_store product_product_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_product_store_store
    ADD CONSTRAINT product_product_store_store_pkey PRIMARY KEY (product_id, store_id);


--
-- Name: product_sales_channel product_sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_sales_channel
    ADD CONSTRAINT product_sales_channel_pkey PRIMARY KEY (product_id, sales_channel_id);


--
-- Name: product_shipping_profile product_shipping_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_shipping_profile
    ADD CONSTRAINT product_shipping_profile_pkey PRIMARY KEY (product_id, shipping_profile_id);


--
-- Name: product_tag product_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tag
    ADD CONSTRAINT product_tag_pkey PRIMARY KEY (id);


--
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY (product_id, product_tag_id);


--
-- Name: product_type product_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_type
    ADD CONSTRAINT product_type_pkey PRIMARY KEY (id);


--
-- Name: product_variant_inventory_item product_variant_inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_inventory_item
    ADD CONSTRAINT product_variant_inventory_item_pkey PRIMARY KEY (variant_id, inventory_item_id);


--
-- Name: product_variant_option product_variant_option_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_pkey PRIMARY KEY (variant_id, option_value_id);


--
-- Name: product_variant product_variant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant
    ADD CONSTRAINT product_variant_pkey PRIMARY KEY (id);


--
-- Name: product_variant_price_set product_variant_price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_price_set
    ADD CONSTRAINT product_variant_price_set_pkey PRIMARY KEY (variant_id, price_set_id);


--
-- Name: product_variant_product_image product_variant_product_image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_product_image
    ADD CONSTRAINT product_variant_product_image_pkey PRIMARY KEY (id);


--
-- Name: promotion_application_method promotion_application_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_application_method
    ADD CONSTRAINT promotion_application_method_pkey PRIMARY KEY (id);


--
-- Name: promotion_campaign_budget promotion_campaign_budget_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_campaign_budget
    ADD CONSTRAINT promotion_campaign_budget_pkey PRIMARY KEY (id);


--
-- Name: promotion_campaign_budget_usage promotion_campaign_budget_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_campaign_budget_usage
    ADD CONSTRAINT promotion_campaign_budget_usage_pkey PRIMARY KEY (id);


--
-- Name: promotion_campaign promotion_campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_campaign
    ADD CONSTRAINT promotion_campaign_pkey PRIMARY KEY (id);


--
-- Name: promotion_campaign_store_store promotion_campaign_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_campaign_store_store
    ADD CONSTRAINT promotion_campaign_store_store_pkey PRIMARY KEY (campaign_id, store_id);


--
-- Name: promotion promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion
    ADD CONSTRAINT promotion_pkey PRIMARY KEY (id);


--
-- Name: promotion_promotion_rule promotion_promotion_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_promotion_rule
    ADD CONSTRAINT promotion_promotion_rule_pkey PRIMARY KEY (promotion_id, promotion_rule_id);


--
-- Name: promotion_promotion_store_store promotion_promotion_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_promotion_store_store
    ADD CONSTRAINT promotion_promotion_store_store_pkey PRIMARY KEY (promotion_id, store_id);


--
-- Name: promotion_rule promotion_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rule
    ADD CONSTRAINT promotion_rule_pkey PRIMARY KEY (id);


--
-- Name: promotion_rule_value promotion_rule_value_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rule_value
    ADD CONSTRAINT promotion_rule_value_pkey PRIMARY KEY (id);


--
-- Name: property_label property_label_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_label
    ADD CONSTRAINT property_label_pkey PRIMARY KEY (id);


--
-- Name: provider_identity provider_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_identity
    ADD CONSTRAINT provider_identity_pkey PRIMARY KEY (id);


--
-- Name: publishable_api_key_sales_channel publishable_api_key_sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publishable_api_key_sales_channel
    ADD CONSTRAINT publishable_api_key_sales_channel_pkey PRIMARY KEY (publishable_key_id, sales_channel_id);


--
-- Name: refund refund_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund
    ADD CONSTRAINT refund_pkey PRIMARY KEY (id);


--
-- Name: refund_reason refund_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund_reason
    ADD CONSTRAINT refund_reason_pkey PRIMARY KEY (id);


--
-- Name: region_country region_country_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.region_country
    ADD CONSTRAINT region_country_pkey PRIMARY KEY (iso_2);


--
-- Name: region_payment_provider region_payment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.region_payment_provider
    ADD CONSTRAINT region_payment_provider_pkey PRIMARY KEY (region_id, payment_provider_id);


--
-- Name: region region_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.region
    ADD CONSTRAINT region_pkey PRIMARY KEY (id);


--
-- Name: renewal_attempt renewal_attempt_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.renewal_attempt
    ADD CONSTRAINT renewal_attempt_pkey PRIMARY KEY (id);


--
-- Name: renewal_cycle renewal_cycle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.renewal_cycle
    ADD CONSTRAINT renewal_cycle_pkey PRIMARY KEY (id);


--
-- Name: renewal_renewal_cycle_order_order renewal_renewal_cycle_order_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.renewal_renewal_cycle_order_order
    ADD CONSTRAINT renewal_renewal_cycle_order_order_pkey PRIMARY KEY (renewal_cycle_id, order_id);


--
-- Name: reservation_item reservation_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_item
    ADD CONSTRAINT reservation_item_pkey PRIMARY KEY (id);


--
-- Name: retention_offer_event retention_offer_event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retention_offer_event
    ADD CONSTRAINT retention_offer_event_pkey PRIMARY KEY (id);


--
-- Name: return_fulfillment return_fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_fulfillment
    ADD CONSTRAINT return_fulfillment_pkey PRIMARY KEY (return_id, fulfillment_id);


--
-- Name: return_item return_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_item
    ADD CONSTRAINT return_item_pkey PRIMARY KEY (id);


--
-- Name: return return_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return
    ADD CONSTRAINT return_pkey PRIMARY KEY (id);


--
-- Name: return_reason return_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_reason
    ADD CONSTRAINT return_reason_pkey PRIMARY KEY (id);


--
-- Name: sales_channel sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_channel
    ADD CONSTRAINT sales_channel_pkey PRIMARY KEY (id);


--
-- Name: sales_channel_stock_location sales_channel_stock_location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_channel_stock_location
    ADD CONSTRAINT sales_channel_stock_location_pkey PRIMARY KEY (sales_channel_id, stock_location_id);


--
-- Name: script_migrations script_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.script_migrations
    ADD CONSTRAINT script_migrations_pkey PRIMARY KEY (id);


--
-- Name: service_zone service_zone_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_zone
    ADD CONSTRAINT service_zone_pkey PRIMARY KEY (id);


--
-- Name: shipping_option shipping_option_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_pkey PRIMARY KEY (id);


--
-- Name: shipping_option_price_set shipping_option_price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option_price_set
    ADD CONSTRAINT shipping_option_price_set_pkey PRIMARY KEY (shipping_option_id, price_set_id);


--
-- Name: shipping_option_rule shipping_option_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option_rule
    ADD CONSTRAINT shipping_option_rule_pkey PRIMARY KEY (id);


--
-- Name: shipping_option_type shipping_option_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option_type
    ADD CONSTRAINT shipping_option_type_pkey PRIMARY KEY (id);


--
-- Name: shipping_profile shipping_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_profile
    ADD CONSTRAINT shipping_profile_pkey PRIMARY KEY (id);


--
-- Name: stock_location_address stock_location_address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_location_address
    ADD CONSTRAINT stock_location_address_pkey PRIMARY KEY (id);


--
-- Name: stock_location stock_location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_location
    ADD CONSTRAINT stock_location_pkey PRIMARY KEY (id);


--
-- Name: stock_location_stock_location_store_store stock_location_stock_location_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_location_stock_location_store_store
    ADD CONSTRAINT stock_location_stock_location_store_store_pkey PRIMARY KEY (stock_location_id, store_id);


--
-- Name: store_config store_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_config
    ADD CONSTRAINT store_config_pkey PRIMARY KEY (id);


--
-- Name: store_currency store_currency_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_currency
    ADD CONSTRAINT store_currency_pkey PRIMARY KEY (id);


--
-- Name: store_locale store_locale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_locale
    ADD CONSTRAINT store_locale_pkey PRIMARY KEY (id);


--
-- Name: store store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store
    ADD CONSTRAINT store_pkey PRIMARY KEY (id);


--
-- Name: storeconfigmodule_store_config_store_store storeconfigmodule_store_config_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storeconfigmodule_store_config_store_store
    ADD CONSTRAINT storeconfigmodule_store_config_store_store_pkey PRIMARY KEY (store_config_id, store_id);


--
-- Name: subscription_log subscription_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_log
    ADD CONSTRAINT subscription_log_pkey PRIMARY KEY (id);


--
-- Name: subscription_metrics_daily subscription_metrics_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_metrics_daily
    ADD CONSTRAINT subscription_metrics_daily_pkey PRIMARY KEY (id);


--
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (id);


--
-- Name: subscription_settings subscription_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_settings
    ADD CONSTRAINT subscription_settings_pkey PRIMARY KEY (id);


--
-- Name: subscription_subscription_cancellation_cancellation_case subscription_subscription_cancellation_cancellation_case_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_subscription_cancellation_cancellation_case
    ADD CONSTRAINT subscription_subscription_cancellation_cancellation_case_pkey PRIMARY KEY (subscription_id, cancellation_case_id);


--
-- Name: subscription_subscription_cart_cart subscription_subscription_cart_cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_subscription_cart_cart
    ADD CONSTRAINT subscription_subscription_cart_cart_pkey PRIMARY KEY (subscription_id, cart_id);


--
-- Name: subscription_subscription_customer_customer subscription_subscription_customer_customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_subscription_customer_customer
    ADD CONSTRAINT subscription_subscription_customer_customer_pkey PRIMARY KEY (subscription_id, customer_id);


--
-- Name: subscription_subscription_order_order subscription_subscription_order_order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_subscription_order_order
    ADD CONSTRAINT subscription_subscription_order_order_pkey PRIMARY KEY (subscription_id, order_id);


--
-- Name: subscription_subscription_product_product subscription_subscription_product_product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_subscription_product_product
    ADD CONSTRAINT subscription_subscription_product_product_pkey PRIMARY KEY (subscription_id, product_id);


--
-- Name: subscription_subscription_product_product_variant subscription_subscription_product_product_variant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_subscription_product_product_variant
    ADD CONSTRAINT subscription_subscription_product_product_variant_pkey PRIMARY KEY (subscription_id, product_variant_id);


--
-- Name: subscription_subscription_renewal_renewal_cycle subscription_subscription_renewal_renewal_cycle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_subscription_renewal_renewal_cycle
    ADD CONSTRAINT subscription_subscription_renewal_renewal_cycle_pkey PRIMARY KEY (subscription_id, renewal_cycle_id);


--
-- Name: super_admin super_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_pkey PRIMARY KEY (id);


--
-- Name: tax_provider tax_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_provider
    ADD CONSTRAINT tax_provider_pkey PRIMARY KEY (id);


--
-- Name: tax_rate tax_rate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_rate
    ADD CONSTRAINT tax_rate_pkey PRIMARY KEY (id);


--
-- Name: tax_rate_rule tax_rate_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_rate_rule
    ADD CONSTRAINT tax_rate_rule_pkey PRIMARY KEY (id);


--
-- Name: tax_region tax_region_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_region
    ADD CONSTRAINT tax_region_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_preference user_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preference
    ADD CONSTRAINT user_preference_pkey PRIMARY KEY (id);


--
-- Name: user_rbac_role user_rbac_role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_rbac_role
    ADD CONSTRAINT user_rbac_role_pkey PRIMARY KEY (user_id, rbac_role_id);


--
-- Name: user_user_store_store user_user_store_store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_user_store_store
    ADD CONSTRAINT user_user_store_store_pkey PRIMARY KEY (user_id, store_id);


--
-- Name: user_user_super_admin_super_admin user_user_super_admin_super_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_user_super_admin_super_admin
    ADD CONSTRAINT user_user_super_admin_super_admin_pkey PRIMARY KEY (user_id, super_admin_id);


--
-- Name: view_configuration view_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.view_configuration
    ADD CONSTRAINT view_configuration_pkey PRIMARY KEY (id);


--
-- Name: workflow_execution workflow_execution_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_execution
    ADD CONSTRAINT workflow_execution_pkey PRIMARY KEY (workflow_id, transaction_id, run_id);


--
-- Name: IDX_account_holder_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_account_holder_deleted_at" ON public.account_holder USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_account_holder_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_account_holder_id_5cb3a0c0" ON public.customer_account_holder USING btree (account_holder_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_account_holder_provider_id_external_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_account_holder_provider_id_external_id_unique" ON public.account_holder USING btree (provider_id, external_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_api_key_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_api_key_deleted_at" ON public.api_key USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_api_key_id_ac1a6d00; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_api_key_id_ac1a6d00" ON public.api_key_api_key_store_store USING btree (api_key_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_api_key_redacted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_api_key_redacted" ON public.api_key USING btree (redacted) WHERE (deleted_at IS NULL);


--
-- Name: IDX_api_key_revoked_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_api_key_revoked_at" ON public.api_key USING btree (revoked_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_api_key_token_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_api_key_token_unique" ON public.api_key USING btree (token);


--
-- Name: IDX_api_key_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_api_key_type" ON public.api_key USING btree (type);


--
-- Name: IDX_application_method_allocation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_application_method_allocation" ON public.promotion_application_method USING btree (allocation);


--
-- Name: IDX_application_method_target_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_application_method_target_type" ON public.promotion_application_method USING btree (target_type);


--
-- Name: IDX_application_method_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_application_method_type" ON public.promotion_application_method USING btree (type);


--
-- Name: IDX_auth_identity_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_identity_deleted_at" ON public.auth_identity USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_mfa_factor_auth_identity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_mfa_factor_auth_identity_id" ON public.auth_mfa_factor USING btree (auth_identity_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_mfa_factor_auth_identity_provider_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_auth_mfa_factor_auth_identity_provider_active" ON public.auth_mfa_factor USING btree (auth_identity_id, provider) WHERE ((deleted_at IS NULL) AND (status = ANY (ARRAY['pending'::text, 'enabled'::text])));


--
-- Name: IDX_auth_mfa_factor_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_mfa_factor_deleted_at" ON public.auth_mfa_factor USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_mfa_recovery_code_auth_identity_code_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_auth_mfa_recovery_code_auth_identity_code_hash" ON public.auth_mfa_recovery_code USING btree (auth_identity_id, code_hash) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_mfa_recovery_code_auth_identity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_mfa_recovery_code_auth_identity_id" ON public.auth_mfa_recovery_code USING btree (auth_identity_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_mfa_recovery_code_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_mfa_recovery_code_deleted_at" ON public.auth_mfa_recovery_code USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_password_reset_token_auth_identity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_password_reset_token_auth_identity_id" ON public.auth_password_reset_token USING btree (auth_identity_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_password_reset_token_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_password_reset_token_deleted_at" ON public.auth_password_reset_token USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_password_reset_token_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_password_reset_token_expires_at" ON public.auth_password_reset_token USING btree (expires_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_password_reset_token_provider_identity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_password_reset_token_provider_identity_id" ON public.auth_password_reset_token USING btree (provider_identity_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_password_reset_token_token_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_password_reset_token_token_hash" ON public.auth_password_reset_token USING btree (token_hash) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_verification_auth_identity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_verification_auth_identity_id" ON public.auth_verification USING btree (auth_identity_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_verification_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_auth_verification_deleted_at" ON public.auth_verification USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_auth_verification_unique_auth_identity_entity_id_entity_typ; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_auth_verification_unique_auth_identity_entity_id_entity_typ" ON public.auth_verification USING btree (auth_identity_id, entity_id, entity_type) WHERE (deleted_at IS NULL);


--
-- Name: IDX_campaign_budget_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_campaign_budget_type" ON public.promotion_campaign_budget USING btree (type);


--
-- Name: IDX_campaign_id_111074f43; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_campaign_id_111074f43" ON public.promotion_campaign_store_store USING btree (campaign_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cancellation_case_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cancellation_case_created_at" ON public.cancellation_case USING btree (created_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cancellation_case_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cancellation_case_deleted_at" ON public.cancellation_case USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cancellation_case_final_outcome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cancellation_case_final_outcome" ON public.cancellation_case USING btree (final_outcome) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cancellation_case_id_2b1e17fc1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cancellation_case_id_2b1e17fc1" ON public.subscription_subscription_cancellation_cancellation_case USING btree (cancellation_case_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cancellation_case_reason_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cancellation_case_reason_category" ON public.cancellation_case USING btree (reason_category) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cancellation_case_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cancellation_case_status" ON public.cancellation_case USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cancellation_case_status_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cancellation_case_status_created_at" ON public.cancellation_case USING btree (status, created_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cancellation_case_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cancellation_case_subscription_id" ON public.cancellation_case USING btree (subscription_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cancellation_case_subscription_id_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cancellation_case_subscription_id_status" ON public.cancellation_case USING btree (subscription_id, status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_capture_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_capture_deleted_at" ON public.capture USING btree (deleted_at);


--
-- Name: IDX_capture_payment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_capture_payment_id" ON public.capture USING btree (payment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_address_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_address_deleted_at" ON public.cart_address USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_billing_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_billing_address_id" ON public.cart USING btree (billing_address_id) WHERE ((deleted_at IS NULL) AND (billing_address_id IS NOT NULL));


--
-- Name: IDX_cart_credit_line_reference_reference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_credit_line_reference_reference_id" ON public.credit_line USING btree (reference, reference_id) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_currency_code" ON public.cart USING btree (currency_code);


--
-- Name: IDX_cart_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_customer_id" ON public.cart USING btree (customer_id) WHERE ((deleted_at IS NULL) AND (customer_id IS NOT NULL));


--
-- Name: IDX_cart_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_deleted_at" ON public.cart USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_id_-4a39f6c9" ON public.cart_payment_collection USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_id_-71069c16; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_id_-71069c16" ON public.order_cart USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_id_-a9d4a70b" ON public.cart_promotion USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_id_869a9d60; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_id_869a9d60" ON public.subscription_subscription_cart_cart USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_line_item_adjustment_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_line_item_adjustment_deleted_at" ON public.cart_line_item_adjustment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_line_item_adjustment_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_line_item_adjustment_item_id" ON public.cart_line_item_adjustment USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_line_item_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_line_item_cart_id" ON public.cart_line_item USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_line_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_line_item_deleted_at" ON public.cart_line_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_line_item_tax_line_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_line_item_tax_line_deleted_at" ON public.cart_line_item_tax_line USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_line_item_tax_line_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_line_item_tax_line_item_id" ON public.cart_line_item_tax_line USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_region_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_region_id" ON public.cart USING btree (region_id) WHERE ((deleted_at IS NULL) AND (region_id IS NOT NULL));


--
-- Name: IDX_cart_sales_channel_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_sales_channel_id" ON public.cart USING btree (sales_channel_id) WHERE ((deleted_at IS NULL) AND (sales_channel_id IS NOT NULL));


--
-- Name: IDX_cart_shipping_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_address_id" ON public.cart USING btree (shipping_address_id) WHERE ((deleted_at IS NULL) AND (shipping_address_id IS NOT NULL));


--
-- Name: IDX_cart_shipping_method_adjustment_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_method_adjustment_deleted_at" ON public.cart_shipping_method_adjustment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_shipping_method_adjustment_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_method_adjustment_shipping_method_id" ON public.cart_shipping_method_adjustment USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_shipping_method_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_method_cart_id" ON public.cart_shipping_method USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_cart_shipping_method_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_method_deleted_at" ON public.cart_shipping_method USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_shipping_method_tax_line_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_method_tax_line_deleted_at" ON public.cart_shipping_method_tax_line USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_cart_shipping_method_tax_line_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cart_shipping_method_tax_line_shipping_method_id" ON public.cart_shipping_method_tax_line USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_category_handle_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_category_handle_unique" ON public.product_category USING btree (handle) WHERE (deleted_at IS NULL);


--
-- Name: IDX_collection_handle_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_collection_handle_unique" ON public.product_collection USING btree (handle) WHERE (deleted_at IS NULL);


--
-- Name: IDX_credit_line_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_credit_line_cart_id" ON public.credit_line USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_credit_line_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_credit_line_deleted_at" ON public.credit_line USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_address_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_address_customer_id" ON public.customer_address USING btree (customer_id);


--
-- Name: IDX_customer_address_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_address_deleted_at" ON public.customer_address USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_address_unique_customer_billing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_customer_address_unique_customer_billing" ON public.customer_address USING btree (customer_id) WHERE (is_default_billing = true);


--
-- Name: IDX_customer_address_unique_customer_shipping; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_customer_address_unique_customer_shipping" ON public.customer_address USING btree (customer_id) WHERE (is_default_shipping = true);


--
-- Name: IDX_customer_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_deleted_at" ON public.customer USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_email_has_account_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_customer_email_has_account_unique" ON public.customer USING btree (email, has_account) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_group_customer_customer_group_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_group_customer_customer_group_id" ON public.customer_group_customer USING btree (customer_group_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_group_customer_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_group_customer_customer_id" ON public.customer_group_customer USING btree (customer_id);


--
-- Name: IDX_customer_group_customer_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_group_customer_deleted_at" ON public.customer_group_customer USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_group_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_group_deleted_at" ON public.customer_group USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_group_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_customer_group_name_unique" ON public.customer_group USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_id_-26637d07a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_id_-26637d07a" ON public.customer_customer_sales_channel_sales_channel USING btree (customer_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_id_-46246f80; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_id_-46246f80" ON public.customer_customer_store_store USING btree (customer_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_id_11f365bb0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_id_11f365bb0" ON public.subscription_subscription_customer_customer USING btree (customer_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_customer_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_customer_id_5cb3a0c0" ON public.customer_account_holder USING btree (customer_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_deleted_at_-10b55d246; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-10b55d246" ON public.user_user_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-11e48e68c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-11e48e68c" ON public.order_order_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-18de26639; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-18de26639" ON public.storeconfigmodule_store_config_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-1bf69be5b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-1bf69be5b" ON public.renewal_renewal_cycle_order_order USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-1d67bae40; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-1e5992737; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-1e5992737" ON public.location_fulfillment_provider USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-225bdf82; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-225bdf82" ON public.product_product_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-25f972bf2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-25f972bf2" ON public.user_user_super_admin_super_admin USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-26637d07a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-26637d07a" ON public.customer_customer_sales_channel_sales_channel USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-31ea43a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-31ea43a" ON public.return_fulfillment USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-429245010; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-429245010" ON public.fulfillment_shipping_profile_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-46246f80; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-46246f80" ON public.customer_customer_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-4a39f6c9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-4a39f6c9" ON public.cart_payment_collection USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-6bab0f5c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-6bab0f5c" ON public.subscription_subscription_order_order USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-71069c16; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-71069c16" ON public.order_cart USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-71518339; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-71518339" ON public.order_promotion USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-85069d44; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-85069d44" ON public.invite_rbac_role USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-a9d4a70b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-a9d4a70b" ON public.cart_promotion USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-e88adb96; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-e88adb96" ON public.location_fulfillment_set USING btree (deleted_at);


--
-- Name: IDX_deleted_at_-e8d2543e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_-e8d2543e" ON public.order_fulfillment USING btree (deleted_at);


--
-- Name: IDX_deleted_at_111074f43; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_111074f43" ON public.promotion_campaign_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_115afb8a2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_115afb8a2" ON public.subscription_subscription_product_product_variant USING btree (deleted_at);


--
-- Name: IDX_deleted_at_11f365bb0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_11f365bb0" ON public.subscription_subscription_customer_customer USING btree (deleted_at);


--
-- Name: IDX_deleted_at_17a262437; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_17a262437" ON public.product_shipping_profile USING btree (deleted_at);


--
-- Name: IDX_deleted_at_17b4c4e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_17b4c4e35" ON public.product_variant_inventory_item USING btree (deleted_at);


--
-- Name: IDX_deleted_at_1942a5cae; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_1942a5cae" ON public.subscription_subscription_product_product USING btree (deleted_at);


--
-- Name: IDX_deleted_at_1c934dab0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_1c934dab0" ON public.region_payment_provider USING btree (deleted_at);


--
-- Name: IDX_deleted_at_20b454295; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_20b454295" ON public.product_sales_channel USING btree (deleted_at);


--
-- Name: IDX_deleted_at_2616f1c7b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_2616f1c7b" ON public.product_product_category_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_26d06f470; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_26d06f470" ON public.sales_channel_stock_location USING btree (deleted_at);


--
-- Name: IDX_deleted_at_2918370a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_2918370a" ON public.promotion_promotion_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_2b1e17fc1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_2b1e17fc1" ON public.subscription_subscription_cancellation_cancellation_case USING btree (deleted_at);


--
-- Name: IDX_deleted_at_3356f68f6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_3356f68f6" ON public.product_product_option_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_52b23597; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_52b23597" ON public.product_variant_price_set USING btree (deleted_at);


--
-- Name: IDX_deleted_at_5cb3a0c0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_5cb3a0c0" ON public.customer_account_holder USING btree (deleted_at);


--
-- Name: IDX_deleted_at_64ff0c4c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_64ff0c4c" ON public.user_rbac_role USING btree (deleted_at);


--
-- Name: IDX_deleted_at_660f596; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_660f596" ON public.pricing_price_list_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_6e8c2577; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_6e8c2577" ON public.subscription_subscription_renewal_renewal_cycle USING btree (deleted_at);


--
-- Name: IDX_deleted_at_72c4c2a9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_72c4c2a9" ON public.product_product_collection_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_869a9d60; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_869a9d60" ON public.subscription_subscription_cart_cart USING btree (deleted_at);


--
-- Name: IDX_deleted_at_ac1a6d00; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_ac1a6d00" ON public.api_key_api_key_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_ba32fa9c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_ba32fa9c" ON public.shipping_option_price_set USING btree (deleted_at);


--
-- Name: IDX_deleted_at_d27ee394; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_d27ee394" ON public.stock_location_stock_location_store_store USING btree (deleted_at);


--
-- Name: IDX_deleted_at_f42b9949; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_deleted_at_f42b9949" ON public.order_payment_collection USING btree (deleted_at);


--
-- Name: IDX_dunning_attempt_attempt_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_attempt_attempt_no" ON public.dunning_attempt USING btree (attempt_no) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_attempt_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_attempt_deleted_at" ON public.dunning_attempt USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_attempt_dunning_case_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_attempt_dunning_case_id" ON public.dunning_attempt USING btree (dunning_case_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_attempt_dunning_case_id_attempt_no_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_dunning_attempt_dunning_case_id_attempt_no_unique" ON public.dunning_attempt USING btree (dunning_case_id, attempt_no) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_attempt_finished_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_attempt_finished_at" ON public.dunning_attempt USING btree (finished_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_attempt_started_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_attempt_started_at" ON public.dunning_attempt USING btree (started_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_attempt_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_attempt_status" ON public.dunning_attempt USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_case_closed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_case_closed_at" ON public.dunning_case USING btree (closed_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_case_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_case_deleted_at" ON public.dunning_case USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_case_last_attempt_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_case_last_attempt_at" ON public.dunning_case USING btree (last_attempt_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_case_next_retry_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_case_next_retry_at" ON public.dunning_case USING btree (next_retry_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_case_recovered_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_case_recovered_at" ON public.dunning_case USING btree (recovered_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_case_renewal_cycle_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_case_renewal_cycle_id" ON public.dunning_case USING btree (renewal_cycle_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_case_renewal_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_case_renewal_order_id" ON public.dunning_case USING btree (renewal_order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_case_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_case_status" ON public.dunning_case USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_case_status_next_retry_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_case_status_next_retry_at" ON public.dunning_case USING btree (status, next_retry_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_dunning_case_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_dunning_case_subscription_id" ON public.dunning_case USING btree (subscription_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_address_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_address_deleted_at" ON public.fulfillment_address USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_fulfillment_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_deleted_at" ON public.fulfillment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_fulfillment_id_-31ea43a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_id_-31ea43a" ON public.return_fulfillment USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_id_-e8d2543e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_id_-e8d2543e" ON public.order_fulfillment USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_item_deleted_at" ON public.fulfillment_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_fulfillment_item_fulfillment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_item_fulfillment_id" ON public.fulfillment_item USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_item_inventory_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_item_inventory_item_id" ON public.fulfillment_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_item_line_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_item_line_item_id" ON public.fulfillment_item USING btree (line_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_label_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_label_deleted_at" ON public.fulfillment_label USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_fulfillment_label_fulfillment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_label_fulfillment_id" ON public.fulfillment_label USING btree (fulfillment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_location_id" ON public.fulfillment USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_provider_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_provider_deleted_at" ON public.fulfillment_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_provider_id_-1e5992737; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_provider_id_-1e5992737" ON public.location_fulfillment_provider USING btree (fulfillment_provider_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_set_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_set_deleted_at" ON public.fulfillment_set USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_fulfillment_set_id_-e88adb96; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_set_id_-e88adb96" ON public.location_fulfillment_set USING btree (fulfillment_set_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_set_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_fulfillment_set_name_unique" ON public.fulfillment_set USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: IDX_fulfillment_shipping_option_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fulfillment_shipping_option_id" ON public.fulfillment USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_geo_zone_city; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_geo_zone_city" ON public.geo_zone USING btree (city) WHERE ((deleted_at IS NULL) AND (city IS NOT NULL));


--
-- Name: IDX_geo_zone_country_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_geo_zone_country_code" ON public.geo_zone USING btree (country_code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_geo_zone_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_geo_zone_deleted_at" ON public.geo_zone USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_geo_zone_province_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_geo_zone_province_code" ON public.geo_zone USING btree (province_code) WHERE ((deleted_at IS NULL) AND (province_code IS NOT NULL));


--
-- Name: IDX_geo_zone_service_zone_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_geo_zone_service_zone_id" ON public.geo_zone USING btree (service_zone_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_id_-10b55d246; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-10b55d246" ON public.user_user_store_store USING btree (id);


--
-- Name: IDX_id_-11e48e68c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-11e48e68c" ON public.order_order_store_store USING btree (id);


--
-- Name: IDX_id_-18de26639; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-18de26639" ON public.storeconfigmodule_store_config_store_store USING btree (id);


--
-- Name: IDX_id_-1bf69be5b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-1bf69be5b" ON public.renewal_renewal_cycle_order_order USING btree (id);


--
-- Name: IDX_id_-1d67bae40; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (id);


--
-- Name: IDX_id_-1e5992737; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-1e5992737" ON public.location_fulfillment_provider USING btree (id);


--
-- Name: IDX_id_-225bdf82; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-225bdf82" ON public.product_product_store_store USING btree (id);


--
-- Name: IDX_id_-25f972bf2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-25f972bf2" ON public.user_user_super_admin_super_admin USING btree (id);


--
-- Name: IDX_id_-26637d07a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-26637d07a" ON public.customer_customer_sales_channel_sales_channel USING btree (id);


--
-- Name: IDX_id_-31ea43a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-31ea43a" ON public.return_fulfillment USING btree (id);


--
-- Name: IDX_id_-429245010; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-429245010" ON public.fulfillment_shipping_profile_store_store USING btree (id);


--
-- Name: IDX_id_-46246f80; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-46246f80" ON public.customer_customer_store_store USING btree (id);


--
-- Name: IDX_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-4a39f6c9" ON public.cart_payment_collection USING btree (id);


--
-- Name: IDX_id_-6bab0f5c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-6bab0f5c" ON public.subscription_subscription_order_order USING btree (id);


--
-- Name: IDX_id_-71069c16; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-71069c16" ON public.order_cart USING btree (id);


--
-- Name: IDX_id_-71518339; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-71518339" ON public.order_promotion USING btree (id);


--
-- Name: IDX_id_-85069d44; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-85069d44" ON public.invite_rbac_role USING btree (id);


--
-- Name: IDX_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-a9d4a70b" ON public.cart_promotion USING btree (id);


--
-- Name: IDX_id_-e88adb96; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-e88adb96" ON public.location_fulfillment_set USING btree (id);


--
-- Name: IDX_id_-e8d2543e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_-e8d2543e" ON public.order_fulfillment USING btree (id);


--
-- Name: IDX_id_111074f43; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_111074f43" ON public.promotion_campaign_store_store USING btree (id);


--
-- Name: IDX_id_115afb8a2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_115afb8a2" ON public.subscription_subscription_product_product_variant USING btree (id);


--
-- Name: IDX_id_11f365bb0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_11f365bb0" ON public.subscription_subscription_customer_customer USING btree (id);


--
-- Name: IDX_id_17a262437; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_17a262437" ON public.product_shipping_profile USING btree (id);


--
-- Name: IDX_id_17b4c4e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (id);


--
-- Name: IDX_id_1942a5cae; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_1942a5cae" ON public.subscription_subscription_product_product USING btree (id);


--
-- Name: IDX_id_1c934dab0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_1c934dab0" ON public.region_payment_provider USING btree (id);


--
-- Name: IDX_id_20b454295; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_20b454295" ON public.product_sales_channel USING btree (id);


--
-- Name: IDX_id_2616f1c7b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_2616f1c7b" ON public.product_product_category_store_store USING btree (id);


--
-- Name: IDX_id_26d06f470; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_26d06f470" ON public.sales_channel_stock_location USING btree (id);


--
-- Name: IDX_id_2918370a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_2918370a" ON public.promotion_promotion_store_store USING btree (id);


--
-- Name: IDX_id_2b1e17fc1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_2b1e17fc1" ON public.subscription_subscription_cancellation_cancellation_case USING btree (id);


--
-- Name: IDX_id_3356f68f6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_3356f68f6" ON public.product_product_option_store_store USING btree (id);


--
-- Name: IDX_id_52b23597; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_52b23597" ON public.product_variant_price_set USING btree (id);


--
-- Name: IDX_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_5cb3a0c0" ON public.customer_account_holder USING btree (id);


--
-- Name: IDX_id_64ff0c4c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_64ff0c4c" ON public.user_rbac_role USING btree (id);


--
-- Name: IDX_id_660f596; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_660f596" ON public.pricing_price_list_store_store USING btree (id);


--
-- Name: IDX_id_6e8c2577; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_6e8c2577" ON public.subscription_subscription_renewal_renewal_cycle USING btree (id);


--
-- Name: IDX_id_72c4c2a9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_72c4c2a9" ON public.product_product_collection_store_store USING btree (id);


--
-- Name: IDX_id_869a9d60; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_869a9d60" ON public.subscription_subscription_cart_cart USING btree (id);


--
-- Name: IDX_id_ac1a6d00; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_ac1a6d00" ON public.api_key_api_key_store_store USING btree (id);


--
-- Name: IDX_id_ba32fa9c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_ba32fa9c" ON public.shipping_option_price_set USING btree (id);


--
-- Name: IDX_id_d27ee394; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_d27ee394" ON public.stock_location_stock_location_store_store USING btree (id);


--
-- Name: IDX_id_f42b9949; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_id_f42b9949" ON public.order_payment_collection USING btree (id);


--
-- Name: IDX_image_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_image_deleted_at" ON public.image USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_image_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_image_product_id" ON public.image USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_item_deleted_at" ON public.inventory_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_inventory_item_id_17b4c4e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_item_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_item_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_inventory_item_sku" ON public.inventory_item USING btree (sku) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_level_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_level_deleted_at" ON public.inventory_level USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_inventory_level_inventory_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_level_inventory_item_id" ON public.inventory_level USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_level_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_inventory_level_location_id" ON public.inventory_level USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_inventory_level_location_id_inventory_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_inventory_level_location_id_inventory_item_id" ON public.inventory_level USING btree (inventory_item_id, location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_invite_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_invite_deleted_at" ON public.invite USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_invite_email_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_invite_email_unique" ON public.invite USING btree (email) WHERE (deleted_at IS NULL);


--
-- Name: IDX_invite_id_-85069d44; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_invite_id_-85069d44" ON public.invite_rbac_role USING btree (invite_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_invite_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_invite_token" ON public.invite USING btree (token) WHERE (deleted_at IS NULL);


--
-- Name: IDX_line_item_adjustment_promotion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_line_item_adjustment_promotion_id" ON public.cart_line_item_adjustment USING btree (promotion_id) WHERE ((deleted_at IS NULL) AND (promotion_id IS NOT NULL));


--
-- Name: IDX_line_item_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_line_item_product_id" ON public.cart_line_item USING btree (product_id) WHERE ((deleted_at IS NULL) AND (product_id IS NOT NULL));


--
-- Name: IDX_line_item_product_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_line_item_product_type_id" ON public.order_line_item USING btree (product_type_id) WHERE ((deleted_at IS NULL) AND (product_type_id IS NOT NULL));


--
-- Name: IDX_line_item_tax_line_tax_rate_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_line_item_tax_line_tax_rate_id" ON public.cart_line_item_tax_line USING btree (tax_rate_id) WHERE ((deleted_at IS NULL) AND (tax_rate_id IS NOT NULL));


--
-- Name: IDX_line_item_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_line_item_variant_id" ON public.cart_line_item USING btree (variant_id) WHERE ((deleted_at IS NULL) AND (variant_id IS NOT NULL));


--
-- Name: IDX_notification_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_notification_deleted_at" ON public.notification USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_notification_idempotency_key_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_notification_idempotency_key_unique" ON public.notification USING btree (idempotency_key) WHERE (deleted_at IS NULL);


--
-- Name: IDX_notification_provider_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_notification_provider_deleted_at" ON public.notification_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_notification_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_notification_provider_id" ON public.notification USING btree (provider_id);


--
-- Name: IDX_notification_receiver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_notification_receiver_id" ON public.notification USING btree (receiver_id);


--
-- Name: IDX_option_value_option_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_option_value_option_id_unique" ON public.product_option_value USING btree (option_id, value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_address_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_address_customer_id" ON public.order_address USING btree (customer_id);


--
-- Name: IDX_order_address_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_address_deleted_at" ON public.order_address USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_billing_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_billing_address_id" ON public."order" USING btree (billing_address_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_change_action_claim_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_claim_id" ON public.order_change_action USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_change_action_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_deleted_at" ON public.order_change_action USING btree (deleted_at);


--
-- Name: IDX_order_change_action_exchange_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_exchange_id" ON public.order_change_action USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_change_action_order_change_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_order_change_id" ON public.order_change_action USING btree (order_change_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_change_action_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_order_id" ON public.order_change_action USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_change_action_ordering; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_ordering" ON public.order_change_action USING btree (ordering) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_change_action_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_action_return_id" ON public.order_change_action USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_change_change_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_change_type" ON public.order_change USING btree (change_type);


--
-- Name: IDX_order_change_claim_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_claim_id" ON public.order_change USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_change_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_deleted_at" ON public.order_change USING btree (deleted_at);


--
-- Name: IDX_order_change_exchange_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_exchange_id" ON public.order_change USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_change_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_order_id" ON public.order_change USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_change_order_id_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_order_id_version" ON public.order_change USING btree (order_id, version);


--
-- Name: IDX_order_change_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_return_id" ON public.order_change USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_change_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_status" ON public.order_change USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_change_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_change_version" ON public.order_change USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_deleted_at" ON public.order_claim USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_display_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_display_id" ON public.order_claim USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_item_claim_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_item_claim_id" ON public.order_claim_item USING btree (claim_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_item_deleted_at" ON public.order_claim_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_item_image_claim_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_item_image_claim_item_id" ON public.order_claim_item_image USING btree (claim_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_item_image_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_item_image_deleted_at" ON public.order_claim_item_image USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_order_claim_item_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_item_item_id" ON public.order_claim_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_order_id" ON public.order_claim USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_claim_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_claim_return_id" ON public.order_claim USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_credit_line_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_credit_line_deleted_at" ON public.order_credit_line USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_order_credit_line_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_credit_line_order_id" ON public.order_credit_line USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_credit_line_order_id_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_credit_line_order_id_version" ON public.order_credit_line USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_currency_code" ON public."order" USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_custom_display_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_order_custom_display_id" ON public."order" USING btree (custom_display_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_customer_id" ON public."order" USING btree (customer_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_deleted_at" ON public."order" USING btree (deleted_at);


--
-- Name: IDX_order_display_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_display_id" ON public."order" USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_deleted_at" ON public.order_exchange USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_display_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_display_id" ON public.order_exchange USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_item_deleted_at" ON public.order_exchange_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_item_exchange_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_item_exchange_id" ON public.order_exchange_item USING btree (exchange_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_item_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_item_item_id" ON public.order_exchange_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_order_id" ON public.order_exchange USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_exchange_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_exchange_return_id" ON public.order_exchange USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_id_-11e48e68c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_id_-11e48e68c" ON public.order_order_store_store USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_id_-1bf69be5b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_id_-1bf69be5b" ON public.renewal_renewal_cycle_order_order USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_id_-6bab0f5c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_id_-6bab0f5c" ON public.subscription_subscription_order_order USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_id_-71069c16; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_id_-71069c16" ON public.order_cart USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_id_-71518339; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_id_-71518339" ON public.order_promotion USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_id_-e8d2543e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_id_-e8d2543e" ON public.order_fulfillment USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_id_f42b9949; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_id_f42b9949" ON public.order_payment_collection USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_is_draft_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_is_draft_order" ON public."order" USING btree (is_draft_order) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_item_deleted_at" ON public.order_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_order_item_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_item_item_id" ON public.order_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_item_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_item_order_id" ON public.order_item USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_item_order_id_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_item_order_id_version" ON public.order_item USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_line_item_adjustment_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_line_item_adjustment_item_id" ON public.order_line_item_adjustment USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_line_item_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_line_item_product_id" ON public.order_line_item USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_line_item_tax_line_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_line_item_tax_line_item_id" ON public.order_line_item_tax_line USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_line_item_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_line_item_variant_id" ON public.order_line_item USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_region_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_region_id" ON public."order" USING btree (region_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_sales_channel_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_sales_channel_id" ON public."order" USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_address_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_address_id" ON public."order" USING btree (shipping_address_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_claim_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_claim_id" ON public.order_shipping USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_shipping_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_deleted_at" ON public.order_shipping USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_order_shipping_exchange_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_exchange_id" ON public.order_shipping USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_shipping_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_item_id" ON public.order_shipping USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_method_adjustment_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_method_adjustment_shipping_method_id" ON public.order_shipping_method_adjustment USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_method_adjustment_version_shipping_method; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_order_shipping_method_adjustment_version_shipping_method" ON public.order_shipping_method_adjustment USING btree (version, shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_method_shipping_option_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_method_shipping_option_id" ON public.order_shipping_method USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_method_tax_line_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_method_tax_line_shipping_method_id" ON public.order_shipping_method_tax_line USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_order_id" ON public.order_shipping USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_order_id_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_order_id_version" ON public.order_shipping USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_shipping_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_return_id" ON public.order_shipping USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_shipping_shipping_method_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_shipping_shipping_method_id" ON public.order_shipping USING btree (shipping_method_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_summary_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_summary_deleted_at" ON public.order_summary USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_order_summary_order_id_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_summary_order_id_version" ON public.order_summary USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_transaction_claim_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_claim_id" ON public.order_transaction USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_transaction_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_currency_code" ON public.order_transaction USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_transaction_exchange_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_exchange_id" ON public.order_transaction USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_order_transaction_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_order_id" ON public.order_transaction USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_transaction_order_id_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_order_id_version" ON public.order_transaction USING btree (order_id, version) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_transaction_reference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_reference_id" ON public.order_transaction USING btree (reference_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_order_transaction_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_order_transaction_return_id" ON public.order_transaction USING btree (return_id) WHERE ((return_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_payment_collection_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_collection_deleted_at" ON public.payment_collection USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_payment_collection_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_collection_id_-4a39f6c9" ON public.cart_payment_collection USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_collection_id_f42b9949; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_collection_id_f42b9949" ON public.order_payment_collection USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_deleted_at" ON public.payment USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_payment_payment_collection_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_payment_collection_id" ON public.payment USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_payment_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_payment_session_id" ON public.payment USING btree (payment_session_id);


--
-- Name: IDX_payment_payment_session_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_payment_payment_session_id_unique" ON public.payment USING btree (payment_session_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_provider_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_provider_deleted_at" ON public.payment_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_provider_id" ON public.payment USING btree (provider_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_provider_id_1c934dab0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_provider_id_1c934dab0" ON public.region_payment_provider USING btree (payment_provider_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_payment_session_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_session_deleted_at" ON public.payment_session USING btree (deleted_at);


--
-- Name: IDX_payment_session_payment_collection_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_payment_session_payment_collection_id" ON public.payment_session USING btree (payment_collection_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_plan_offer_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_plan_offer_created_at" ON public.plan_offer USING btree (created_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_plan_offer_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_plan_offer_deleted_at" ON public.plan_offer USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_plan_offer_frequency_intervals; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_plan_offer_frequency_intervals" ON public.plan_offer USING gin (frequency_intervals) WHERE (deleted_at IS NULL);


--
-- Name: IDX_plan_offer_is_enabled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_plan_offer_is_enabled" ON public.plan_offer USING btree (is_enabled) WHERE (deleted_at IS NULL);


--
-- Name: IDX_plan_offer_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_plan_offer_name" ON public.plan_offer USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: IDX_plan_offer_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_plan_offer_product_id" ON public.plan_offer USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_plan_offer_product_target_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_plan_offer_product_target_unique" ON public.plan_offer USING btree (product_id) WHERE ((scope = 'product'::text) AND (deleted_at IS NULL));


--
-- Name: IDX_plan_offer_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_plan_offer_scope" ON public.plan_offer USING btree (scope) WHERE (deleted_at IS NULL);


--
-- Name: IDX_plan_offer_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_plan_offer_updated_at" ON public.plan_offer USING btree (updated_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_plan_offer_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_plan_offer_variant_id" ON public.plan_offer USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_plan_offer_variant_target_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_plan_offer_variant_target_unique" ON public.plan_offer USING btree (variant_id) WHERE ((scope = 'variant'::text) AND (deleted_at IS NULL));


--
-- Name: IDX_price_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_currency_code" ON public.price USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_deleted_at" ON public.price USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_list_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_deleted_at" ON public.price_list USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_list_id_660f596; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_id_660f596" ON public.pricing_price_list_store_store USING btree (price_list_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_list_id_status_starts_at_ends_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_id_status_starts_at_ends_at" ON public.price_list USING btree (id, status, starts_at, ends_at) WHERE ((deleted_at IS NULL) AND (status = 'active'::text));


--
-- Name: IDX_price_list_rule_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_rule_attribute" ON public.price_list_rule USING btree (attribute) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_list_rule_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_rule_deleted_at" ON public.price_list_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_list_rule_price_list_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_rule_price_list_id" ON public.price_list_rule USING btree (price_list_id) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_list_rule_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_list_rule_value" ON public.price_list_rule USING gin (value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_preference_attribute_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_price_preference_attribute_value" ON public.price_preference USING btree (attribute, value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_preference_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_preference_deleted_at" ON public.price_preference USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_price_list_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_price_list_id" ON public.price USING btree (price_list_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_price_set_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_price_set_id" ON public.price USING btree (price_set_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_rule_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_attribute" ON public.price_rule USING btree (attribute) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_rule_attribute_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_attribute_value" ON public.price_rule USING btree (attribute, value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_rule_attribute_value_price_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_attribute_value_price_id" ON public.price_rule USING btree (attribute, value, price_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_rule_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_deleted_at" ON public.price_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_rule_operator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_operator" ON public.price_rule USING btree (operator);


--
-- Name: IDX_price_rule_operator_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_operator_value" ON public.price_rule USING btree (operator, value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_rule_price_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_rule_price_id" ON public.price_rule USING btree (price_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_rule_price_id_attribute_operator_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_price_rule_price_id_attribute_operator_unique" ON public.price_rule USING btree (price_id, attribute, operator) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_set_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_set_deleted_at" ON public.price_set USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_price_set_id_52b23597; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_set_id_52b23597" ON public.product_variant_price_set USING btree (price_set_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_price_set_id_ba32fa9c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_price_set_id_ba32fa9c" ON public.shipping_option_price_set USING btree (price_set_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_category_id_2616f1c7b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_category_id_2616f1c7b" ON public.product_product_category_store_store USING btree (product_category_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_category_image_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_category_image_deleted_at" ON public.product_category_image USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_category_parent_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_category_parent_category_id" ON public.product_category USING btree (parent_category_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_category_path; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_category_path" ON public.product_category USING btree (mpath) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_collection_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_collection_deleted_at" ON public.product_collection USING btree (deleted_at);


--
-- Name: IDX_product_collection_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_collection_id" ON public.product USING btree (collection_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_collection_id_72c4c2a9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_collection_id_72c4c2a9" ON public.product_product_collection_store_store USING btree (product_collection_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_deleted_at" ON public.product USING btree (deleted_at);


--
-- Name: IDX_product_handle_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_product_handle_unique" ON public.product USING btree (handle) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_id_-225bdf82; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_id_-225bdf82" ON public.product_product_store_store USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_id_17a262437; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_id_17a262437" ON public.product_shipping_profile USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_id_1942a5cae; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_id_1942a5cae" ON public.subscription_subscription_product_product USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_id_20b454295; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_id_20b454295" ON public.product_sales_channel USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_image_rank; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_image_rank" ON public.image USING btree (rank) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_image_rank_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_image_rank_product_id" ON public.image USING btree (rank, product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_image_url; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_image_url" ON public.image USING btree (url) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_image_url_rank_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_image_url_rank_product_id" ON public.image USING btree (url, rank, product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_option_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_option_deleted_at" ON public.product_option USING btree (deleted_at);


--
-- Name: IDX_product_option_id_3356f68f6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_option_id_3356f68f6" ON public.product_product_option_store_store USING btree (product_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_option_value_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_option_value_deleted_at" ON public.product_option_value USING btree (deleted_at);


--
-- Name: IDX_product_option_value_option_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_option_value_option_id" ON public.product_option_value USING btree (option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_product_option_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_product_option_deleted_at" ON public.product_product_option USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_product_option_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_product_option_product_id" ON public.product_product_option USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_product_option_product_option_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_product_option_product_option_id" ON public.product_product_option USING btree (product_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_product_option_value_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_product_option_value_deleted_at" ON public.product_product_option_value USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_product_option_value_product_option_value_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_product_option_value_product_option_value_id" ON public.product_product_option_value USING btree (product_option_value_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_product_option_value_product_product_option_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_product_option_value_product_product_option_id" ON public.product_product_option_value USING btree (product_product_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_status" ON public.product USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_tag_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_tag_deleted_at" ON public.product_tag USING btree (deleted_at);


--
-- Name: IDX_product_type_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_type_deleted_at" ON public.product_type USING btree (deleted_at);


--
-- Name: IDX_product_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_type_id" ON public.product USING btree (type_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_barcode_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_product_variant_barcode_unique" ON public.product_variant USING btree (barcode) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_deleted_at" ON public.product_variant USING btree (deleted_at);


--
-- Name: IDX_product_variant_ean_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_product_variant_ean_unique" ON public.product_variant USING btree (ean) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_id_115afb8a2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_id_115afb8a2" ON public.subscription_subscription_product_product_variant USING btree (product_variant_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_id_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_id_product_id" ON public.product_variant USING btree (id, product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_product_id" ON public.product_variant USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_product_image_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_product_image_deleted_at" ON public.product_variant_product_image USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_product_image_image_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_product_image_image_id" ON public.product_variant_product_image USING btree (image_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_product_image_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_product_variant_product_image_variant_id" ON public.product_variant_product_image USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_sku_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_product_variant_sku_unique" ON public.product_variant USING btree (sku) WHERE (deleted_at IS NULL);


--
-- Name: IDX_product_variant_upc_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_product_variant_upc_unique" ON public.product_variant USING btree (upc) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_application_method_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_application_method_currency_code" ON public.promotion_application_method USING btree (currency_code) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_promotion_application_method_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_application_method_deleted_at" ON public.promotion_application_method USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_application_method_promotion_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_promotion_application_method_promotion_id_unique" ON public.promotion_application_method USING btree (promotion_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_budget_campaign_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_budget_campaign_id_unique" ON public.promotion_campaign_budget USING btree (campaign_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_budget_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_campaign_budget_deleted_at" ON public.promotion_campaign_budget USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_budget_usage_attribute_value_budget_id_u; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_budget_usage_attribute_value_budget_id_u" ON public.promotion_campaign_budget_usage USING btree (attribute_value, budget_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_budget_usage_budget_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_campaign_budget_usage_budget_id" ON public.promotion_campaign_budget_usage USING btree (budget_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_budget_usage_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_campaign_budget_usage_deleted_at" ON public.promotion_campaign_budget_usage USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_campaign_identifier_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_campaign_identifier_unique" ON public.promotion_campaign USING btree (campaign_identifier) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_campaign_deleted_at" ON public.promotion_campaign USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_campaign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_campaign_id" ON public.promotion USING btree (campaign_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_deleted_at" ON public.promotion USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_id_-71518339; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_id_-71518339" ON public.order_promotion USING btree (promotion_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_id_-a9d4a70b" ON public.cart_promotion USING btree (promotion_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_id_2918370a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_id_2918370a" ON public.promotion_promotion_store_store USING btree (promotion_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_is_automatic; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_is_automatic" ON public.promotion USING btree (is_automatic) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_attribute; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_attribute" ON public.promotion_rule USING btree (attribute);


--
-- Name: IDX_promotion_rule_attribute_operator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_attribute_operator" ON public.promotion_rule USING btree (attribute, operator) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_attribute_operator_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_attribute_operator_id" ON public.promotion_rule USING btree (operator, attribute, id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_deleted_at" ON public.promotion_rule USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_operator; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_operator" ON public.promotion_rule USING btree (operator);


--
-- Name: IDX_promotion_rule_value_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_value_deleted_at" ON public.promotion_rule_value USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_value_promotion_rule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_value_promotion_rule_id" ON public.promotion_rule_value USING btree (promotion_rule_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_value_rule_id_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_value_rule_id_value" ON public.promotion_rule_value USING btree (promotion_rule_id, value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_rule_value_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_rule_value_value" ON public.promotion_rule_value USING btree (value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_status" ON public.promotion USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_promotion_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_promotion_type" ON public.promotion USING btree (type);


--
-- Name: IDX_property_label_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_property_label_deleted_at" ON public.property_label USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_property_label_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_property_label_entity" ON public.property_label USING btree (entity) WHERE (deleted_at IS NULL);


--
-- Name: IDX_property_label_entity_property_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_property_label_entity_property_unique" ON public.property_label USING btree (entity, property) WHERE (deleted_at IS NULL);


--
-- Name: IDX_provider_identity_auth_identity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_provider_identity_auth_identity_id" ON public.provider_identity USING btree (auth_identity_id);


--
-- Name: IDX_provider_identity_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_provider_identity_deleted_at" ON public.provider_identity USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_provider_identity_provider_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_provider_identity_provider_entity_id" ON public.provider_identity USING btree (entity_id, provider);


--
-- Name: IDX_publishable_key_id_-1d67bae40; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_publishable_key_id_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (publishable_key_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_rbac_role_id_-85069d44; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_rbac_role_id_-85069d44" ON public.invite_rbac_role USING btree (rbac_role_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_rbac_role_id_64ff0c4c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_rbac_role_id_64ff0c4c" ON public.user_rbac_role USING btree (rbac_role_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_refund_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_refund_deleted_at" ON public.refund USING btree (deleted_at);


--
-- Name: IDX_refund_payment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_refund_payment_id" ON public.refund USING btree (payment_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_refund_reason_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_refund_reason_deleted_at" ON public.refund_reason USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_refund_refund_reason_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_refund_refund_reason_id" ON public.refund USING btree (refund_reason_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_region_country_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_region_country_deleted_at" ON public.region_country USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_region_country_region_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_region_country_region_id" ON public.region_country USING btree (region_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_region_country_region_id_iso_2_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_region_country_region_id_iso_2_unique" ON public.region_country USING btree (region_id, iso_2);


--
-- Name: IDX_region_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_region_deleted_at" ON public.region USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_region_id_1c934dab0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_region_id_1c934dab0" ON public.region_payment_provider USING btree (region_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_attempt_attempt_no; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_attempt_attempt_no" ON public.renewal_attempt USING btree (attempt_no) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_attempt_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_attempt_deleted_at" ON public.renewal_attempt USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_attempt_finished_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_attempt_finished_at" ON public.renewal_attempt USING btree (finished_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_attempt_renewal_cycle_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_attempt_renewal_cycle_id" ON public.renewal_attempt USING btree (renewal_cycle_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_attempt_renewal_cycle_id_attempt_no_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_renewal_attempt_renewal_cycle_id_attempt_no_unique" ON public.renewal_attempt USING btree (renewal_cycle_id, attempt_no) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_attempt_started_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_attempt_started_at" ON public.renewal_attempt USING btree (started_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_attempt_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_attempt_status" ON public.renewal_attempt USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_cycle_approval_required; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_cycle_approval_required" ON public.renewal_cycle USING btree (approval_required) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_cycle_approval_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_cycle_approval_status" ON public.renewal_cycle USING btree (approval_status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_cycle_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_cycle_deleted_at" ON public.renewal_cycle USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_cycle_generated_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_cycle_generated_order_id" ON public.renewal_cycle USING btree (generated_order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_cycle_id_-1bf69be5b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_cycle_id_-1bf69be5b" ON public.renewal_renewal_cycle_order_order USING btree (renewal_cycle_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_cycle_id_6e8c2577; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_cycle_id_6e8c2577" ON public.subscription_subscription_renewal_renewal_cycle USING btree (renewal_cycle_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_cycle_scheduled_for; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_cycle_scheduled_for" ON public.renewal_cycle USING btree (scheduled_for) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_cycle_scheduled_for_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_cycle_scheduled_for_status" ON public.renewal_cycle USING btree (scheduled_for, status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_cycle_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_cycle_status" ON public.renewal_cycle USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_renewal_cycle_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_renewal_cycle_subscription_id" ON public.renewal_cycle USING btree (subscription_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_reservation_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_reservation_item_deleted_at" ON public.reservation_item USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_reservation_item_inventory_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_reservation_item_inventory_item_id" ON public.reservation_item USING btree (inventory_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_reservation_item_line_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_reservation_item_line_item_id" ON public.reservation_item USING btree (line_item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_reservation_item_location_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_reservation_item_location_id" ON public.reservation_item USING btree (location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_retention_offer_event_cancellation_case_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_retention_offer_event_cancellation_case_id" ON public.retention_offer_event USING btree (cancellation_case_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_retention_offer_event_cancellation_case_id_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_retention_offer_event_cancellation_case_id_created_at" ON public.retention_offer_event USING btree (cancellation_case_id, created_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_retention_offer_event_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_retention_offer_event_created_at" ON public.retention_offer_event USING btree (created_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_retention_offer_event_decision_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_retention_offer_event_decision_status" ON public.retention_offer_event USING btree (decision_status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_retention_offer_event_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_retention_offer_event_deleted_at" ON public.retention_offer_event USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_retention_offer_event_offer_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_retention_offer_event_offer_type" ON public.retention_offer_event USING btree (offer_type) WHERE (deleted_at IS NULL);


--
-- Name: IDX_retention_offer_event_offer_type_decision_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_retention_offer_event_offer_type_decision_status" ON public.retention_offer_event USING btree (offer_type, decision_status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_claim_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_claim_id" ON public.return USING btree (claim_id) WHERE ((claim_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_return_display_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_display_id" ON public.return USING btree (display_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_exchange_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_exchange_id" ON public.return USING btree (exchange_id) WHERE ((exchange_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_return_id_-31ea43a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_id_-31ea43a" ON public.return_fulfillment USING btree (return_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_item_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_item_deleted_at" ON public.return_item USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_item_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_item_item_id" ON public.return_item USING btree (item_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_item_reason_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_item_reason_id" ON public.return_item USING btree (reason_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_item_return_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_item_return_id" ON public.return_item USING btree (return_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_order_id" ON public.return USING btree (order_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_reason_parent_return_reason_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_reason_parent_return_reason_id" ON public.return_reason USING btree (parent_return_reason_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_return_reason_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_return_reason_value" ON public.return_reason USING btree (value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_sales_channel_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_sales_channel_deleted_at" ON public.sales_channel USING btree (deleted_at);


--
-- Name: IDX_sales_channel_id_-1d67bae40; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_sales_channel_id_-1d67bae40" ON public.publishable_api_key_sales_channel USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_sales_channel_id_-26637d07a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_sales_channel_id_-26637d07a" ON public.customer_customer_sales_channel_sales_channel USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_sales_channel_id_20b454295; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_sales_channel_id_20b454295" ON public.product_sales_channel USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_sales_channel_id_26d06f470; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_sales_channel_id_26d06f470" ON public.sales_channel_stock_location USING btree (sales_channel_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_service_zone_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_service_zone_deleted_at" ON public.service_zone USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_service_zone_fulfillment_set_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_service_zone_fulfillment_set_id" ON public.service_zone USING btree (fulfillment_set_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_service_zone_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_service_zone_name_unique" ON public.service_zone USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_method_adjustment_promotion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_method_adjustment_promotion_id" ON public.cart_shipping_method_adjustment USING btree (promotion_id) WHERE ((deleted_at IS NULL) AND (promotion_id IS NOT NULL));


--
-- Name: IDX_shipping_method_option_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_method_option_id" ON public.cart_shipping_method USING btree (shipping_option_id) WHERE ((deleted_at IS NULL) AND (shipping_option_id IS NOT NULL));


--
-- Name: IDX_shipping_method_tax_line_tax_rate_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_method_tax_line_tax_rate_id" ON public.cart_shipping_method_tax_line USING btree (tax_rate_id) WHERE ((deleted_at IS NULL) AND (tax_rate_id IS NOT NULL));


--
-- Name: IDX_shipping_option_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_deleted_at" ON public.shipping_option USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_shipping_option_id_ba32fa9c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_id_ba32fa9c" ON public.shipping_option_price_set USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_option_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_provider_id" ON public.shipping_option USING btree (provider_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_option_rule_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_rule_deleted_at" ON public.shipping_option_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_shipping_option_rule_shipping_option_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_rule_shipping_option_id" ON public.shipping_option_rule USING btree (shipping_option_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_option_service_zone_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_service_zone_id" ON public.shipping_option USING btree (service_zone_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_option_shipping_option_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_shipping_option_type_id" ON public.shipping_option USING btree (shipping_option_type_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_option_shipping_profile_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_shipping_profile_id" ON public.shipping_option USING btree (shipping_profile_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_option_type_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_option_type_deleted_at" ON public.shipping_option_type USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_shipping_profile_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_profile_deleted_at" ON public.shipping_profile USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_shipping_profile_id_-429245010; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_profile_id_-429245010" ON public.fulfillment_shipping_profile_store_store USING btree (shipping_profile_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_profile_id_17a262437; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shipping_profile_id_17a262437" ON public.product_shipping_profile USING btree (shipping_profile_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_shipping_profile_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_shipping_profile_name_unique" ON public.shipping_profile USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: IDX_single_default_region; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_single_default_region" ON public.tax_rate USING btree (tax_region_id) WHERE ((is_default = true) AND (deleted_at IS NULL));


--
-- Name: IDX_stock_location_address_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_stock_location_address_deleted_at" ON public.stock_location_address USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_stock_location_address_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_stock_location_address_id_unique" ON public.stock_location USING btree (address_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_stock_location_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_stock_location_deleted_at" ON public.stock_location USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_stock_location_id_-1e5992737; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_stock_location_id_-1e5992737" ON public.location_fulfillment_provider USING btree (stock_location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_stock_location_id_-e88adb96; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_stock_location_id_-e88adb96" ON public.location_fulfillment_set USING btree (stock_location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_stock_location_id_26d06f470; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_stock_location_id_26d06f470" ON public.sales_channel_stock_location USING btree (stock_location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_stock_location_id_d27ee394; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_stock_location_id_d27ee394" ON public.stock_location_stock_location_store_store USING btree (stock_location_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_config_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_config_deleted_at" ON public.store_config USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_config_handle_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_store_config_handle_unique" ON public.store_config USING btree (handle) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_config_id_-18de26639; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_config_id_-18de26639" ON public.storeconfigmodule_store_config_store_store USING btree (store_config_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_config_subscription_product_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_store_config_subscription_product_id_unique" ON public.store_config USING btree (subscription_product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_currency_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_currency_deleted_at" ON public.store_currency USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_store_currency_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_currency_store_id" ON public.store_currency USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_deleted_at" ON public.store USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_store_id_-10b55d246; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_-10b55d246" ON public.user_user_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_-11e48e68c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_-11e48e68c" ON public.order_order_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_-18de26639; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_-18de26639" ON public.storeconfigmodule_store_config_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_-225bdf82; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_-225bdf82" ON public.product_product_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_-429245010; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_-429245010" ON public.fulfillment_shipping_profile_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_-46246f80; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_-46246f80" ON public.customer_customer_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_111074f43; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_111074f43" ON public.promotion_campaign_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_2616f1c7b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_2616f1c7b" ON public.product_product_category_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_2918370a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_2918370a" ON public.promotion_promotion_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_3356f68f6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_3356f68f6" ON public.product_product_option_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_660f596; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_660f596" ON public.pricing_price_list_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_72c4c2a9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_72c4c2a9" ON public.product_product_collection_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_ac1a6d00; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_ac1a6d00" ON public.api_key_api_key_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_id_d27ee394; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_id_d27ee394" ON public.stock_location_stock_location_store_store USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_locale_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_locale_deleted_at" ON public.store_locale USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_store_locale_store_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_store_locale_store_id" ON public.store_locale USING btree (store_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_cart_id" ON public.subscription USING btree (cart_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_customer_id" ON public.subscription USING btree (customer_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_deleted_at" ON public.subscription USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_id_-6bab0f5c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_id_-6bab0f5c" ON public.subscription_subscription_order_order USING btree (subscription_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_id_115afb8a2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_id_115afb8a2" ON public.subscription_subscription_product_product_variant USING btree (subscription_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_id_11f365bb0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_id_11f365bb0" ON public.subscription_subscription_customer_customer USING btree (subscription_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_id_1942a5cae; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_id_1942a5cae" ON public.subscription_subscription_product_product USING btree (subscription_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_id_2b1e17fc1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_id_2b1e17fc1" ON public.subscription_subscription_cancellation_cancellation_case USING btree (subscription_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_id_6e8c2577; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_id_6e8c2577" ON public.subscription_subscription_renewal_renewal_cycle USING btree (subscription_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_id_869a9d60; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_id_869a9d60" ON public.subscription_subscription_cart_cart USING btree (subscription_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_is_trial; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_is_trial" ON public.subscription USING btree (is_trial) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_log_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_log_created_at" ON public.subscription_log USING btree (created_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_log_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_log_customer_id" ON public.subscription_log USING btree (customer_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_log_customer_id_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_log_customer_id_created_at" ON public.subscription_log USING btree (customer_id, created_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_log_dedupe_key_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_subscription_log_dedupe_key_unique" ON public.subscription_log USING btree (dedupe_key) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_log_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_log_deleted_at" ON public.subscription_log USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_log_event_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_log_event_type" ON public.subscription_log USING btree (event_type) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_log_event_type_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_log_event_type_created_at" ON public.subscription_log USING btree (event_type, created_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_log_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_log_subscription_id" ON public.subscription_log USING btree (subscription_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_log_subscription_id_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_log_subscription_id_created_at" ON public.subscription_log USING btree (subscription_id, created_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_currency_code" ON public.subscription_metrics_daily USING btree (currency_code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_deleted_at" ON public.subscription_metrics_daily USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_frequency_interval; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_frequency_interval" ON public.subscription_metrics_daily USING btree (frequency_interval) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_frequency_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_frequency_value" ON public.subscription_metrics_daily USING btree (frequency_value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_metric_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_metric_date" ON public.subscription_metrics_daily USING btree (metric_date) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_metric_date_churn_reason_categor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_metric_date_churn_reason_categor" ON public.subscription_metrics_daily USING btree (metric_date, churn_reason_category) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_metric_date_currency_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_metric_date_currency_code" ON public.subscription_metrics_daily USING btree (metric_date, currency_code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_metric_date_frequency_interval_f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_metric_date_frequency_interval_f" ON public.subscription_metrics_daily USING btree (metric_date, frequency_interval, frequency_value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_metric_date_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_metric_date_product_id" ON public.subscription_metrics_daily USING btree (metric_date, product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_metric_date_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_metric_date_status" ON public.subscription_metrics_daily USING btree (metric_date, status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_product_id" ON public.subscription_metrics_daily USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_status" ON public.subscription_metrics_daily USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_metrics_daily_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_metrics_daily_subscription_id" ON public.subscription_metrics_daily USING btree (subscription_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_next_renewal_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_next_renewal_at" ON public.subscription USING btree (next_renewal_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_product_id" ON public.subscription USING btree (product_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_reference_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_subscription_reference_unique" ON public.subscription USING btree (reference) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_settings_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_settings_deleted_at" ON public.subscription_settings USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_settings_settings_key_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_subscription_settings_settings_key_unique" ON public.subscription_settings USING btree (settings_key) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_skip_next_cycle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_skip_next_cycle" ON public.subscription USING btree (skip_next_cycle) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_status" ON public.subscription USING btree (status) WHERE (deleted_at IS NULL);


--
-- Name: IDX_subscription_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_subscription_variant_id" ON public.subscription USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_super_admin_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_super_admin_deleted_at" ON public.super_admin USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_super_admin_id_-25f972bf2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_super_admin_id_-25f972bf2" ON public.user_user_super_admin_super_admin USING btree (super_admin_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tag_value_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_tag_value_unique" ON public.product_tag USING btree (value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_provider_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_provider_deleted_at" ON public.tax_provider USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_rate_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_rate_deleted_at" ON public.tax_rate USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_tax_rate_rule_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_rate_rule_deleted_at" ON public.tax_rate_rule USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_tax_rate_rule_reference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_rate_rule_reference_id" ON public.tax_rate_rule USING btree (reference_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_rate_rule_tax_rate_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_rate_rule_tax_rate_id" ON public.tax_rate_rule USING btree (tax_rate_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_rate_rule_unique_rate_reference; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_tax_rate_rule_unique_rate_reference" ON public.tax_rate_rule USING btree (tax_rate_id, reference_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_rate_tax_region_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_rate_tax_region_id" ON public.tax_rate USING btree (tax_region_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_region_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_region_deleted_at" ON public.tax_region USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_tax_region_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_region_parent_id" ON public.tax_region USING btree (parent_id);


--
-- Name: IDX_tax_region_provider_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_tax_region_provider_id" ON public.tax_region USING btree (provider_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_tax_region_unique_country_nullable_province; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_tax_region_unique_country_nullable_province" ON public.tax_region USING btree (country_code) WHERE ((province_code IS NULL) AND (deleted_at IS NULL));


--
-- Name: IDX_tax_region_unique_country_province; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_tax_region_unique_country_province" ON public.tax_region USING btree (country_code, province_code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_type_value_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_type_value_unique" ON public.product_type USING btree (value) WHERE (deleted_at IS NULL);


--
-- Name: IDX_unique_promotion_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_unique_promotion_code" ON public.promotion USING btree (code) WHERE (deleted_at IS NULL);


--
-- Name: IDX_user_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_user_deleted_at" ON public."user" USING btree (deleted_at) WHERE (deleted_at IS NOT NULL);


--
-- Name: IDX_user_email_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_user_email_unique" ON public."user" USING btree (email) WHERE (deleted_at IS NULL);


--
-- Name: IDX_user_id_-10b55d246; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_user_id_-10b55d246" ON public.user_user_store_store USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_user_id_-25f972bf2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_user_id_-25f972bf2" ON public.user_user_super_admin_super_admin USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_user_id_64ff0c4c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_user_id_64ff0c4c" ON public.user_rbac_role USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_user_preference_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_user_preference_deleted_at" ON public.user_preference USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_user_preference_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_user_preference_user_id" ON public.user_preference USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_user_preference_user_id_key_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_user_preference_user_id_key_unique" ON public.user_preference USING btree (user_id, key) WHERE (deleted_at IS NULL);


--
-- Name: IDX_variant_id_17b4c4e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_variant_id_17b4c4e35" ON public.product_variant_inventory_item USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_variant_id_52b23597; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_variant_id_52b23597" ON public.product_variant_price_set USING btree (variant_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_view_configuration_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_view_configuration_deleted_at" ON public.view_configuration USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_view_configuration_entity_is_system_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_view_configuration_entity_is_system_default" ON public.view_configuration USING btree (entity, is_system_default) WHERE (deleted_at IS NULL);


--
-- Name: IDX_view_configuration_entity_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_view_configuration_entity_user_id" ON public.view_configuration USING btree (entity, user_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_view_configuration_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_view_configuration_user_id" ON public.view_configuration USING btree (user_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_deleted_at" ON public.workflow_execution USING btree (deleted_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_id" ON public.workflow_execution USING btree (id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_retention_time_updated_at_state; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_retention_time_updated_at_state" ON public.workflow_execution USING btree (retention_time, updated_at, state) WHERE ((deleted_at IS NULL) AND (retention_time IS NOT NULL));


--
-- Name: IDX_workflow_execution_run_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_run_id" ON public.workflow_execution USING btree (run_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_state; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_state" ON public.workflow_execution USING btree (state) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_state_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_state_updated_at" ON public.workflow_execution USING btree (state, updated_at) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_transaction_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_transaction_id" ON public.workflow_execution USING btree (transaction_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_updated_at_retention_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_updated_at_retention_time" ON public.workflow_execution USING btree (updated_at, retention_time) WHERE ((deleted_at IS NULL) AND (retention_time IS NOT NULL) AND ((state)::text = ANY ((ARRAY['done'::character varying, 'failed'::character varying, 'reverted'::character varying])::text[])));


--
-- Name: IDX_workflow_execution_workflow_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_workflow_id" ON public.workflow_execution USING btree (workflow_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_workflow_id_transaction_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_execution_workflow_id_transaction_id" ON public.workflow_execution USING btree (workflow_id, transaction_id) WHERE (deleted_at IS NULL);


--
-- Name: IDX_workflow_execution_workflow_id_transaction_id_run_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_workflow_execution_workflow_id_transaction_id_run_id_unique" ON public.workflow_execution USING btree (workflow_id, transaction_id, run_id) WHERE (deleted_at IS NULL);


--
-- Name: idx_script_name_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_script_name_unique ON public.script_migrations USING btree (script_name);


--
-- Name: unique_thumbnail_per_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_thumbnail_per_category ON public.product_category_image USING btree (category_id, type) WHERE ((type = 'thumbnail'::text) AND (deleted_at IS NULL));


--
-- Name: tax_rate_rule FK_tax_rate_rule_tax_rate_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_rate_rule
    ADD CONSTRAINT "FK_tax_rate_rule_tax_rate_id" FOREIGN KEY (tax_rate_id) REFERENCES public.tax_rate(id) ON DELETE CASCADE;


--
-- Name: tax_rate FK_tax_rate_tax_region_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_rate
    ADD CONSTRAINT "FK_tax_rate_tax_region_id" FOREIGN KEY (tax_region_id) REFERENCES public.tax_region(id) ON DELETE CASCADE;


--
-- Name: tax_region FK_tax_region_parent_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_region
    ADD CONSTRAINT "FK_tax_region_parent_id" FOREIGN KEY (parent_id) REFERENCES public.tax_region(id) ON DELETE CASCADE;


--
-- Name: tax_region FK_tax_region_provider_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_region
    ADD CONSTRAINT "FK_tax_region_provider_id" FOREIGN KEY (provider_id) REFERENCES public.tax_provider(id) ON DELETE SET NULL;


--
-- Name: application_method_buy_rules application_method_buy_rules_application_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_method_buy_rules
    ADD CONSTRAINT application_method_buy_rules_application_method_id_foreign FOREIGN KEY (application_method_id) REFERENCES public.promotion_application_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_method_buy_rules application_method_buy_rules_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_method_buy_rules
    ADD CONSTRAINT application_method_buy_rules_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_method_target_rules application_method_target_rules_application_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_method_target_rules
    ADD CONSTRAINT application_method_target_rules_application_method_id_foreign FOREIGN KEY (application_method_id) REFERENCES public.promotion_application_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_method_target_rules application_method_target_rules_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_method_target_rules
    ADD CONSTRAINT application_method_target_rules_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_mfa_factor auth_mfa_factor_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_mfa_factor
    ADD CONSTRAINT auth_mfa_factor_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_mfa_recovery_code auth_mfa_recovery_code_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_mfa_recovery_code
    ADD CONSTRAINT auth_mfa_recovery_code_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_password_reset_token auth_password_reset_token_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_password_reset_token
    ADD CONSTRAINT auth_password_reset_token_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_password_reset_token auth_password_reset_token_provider_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_password_reset_token
    ADD CONSTRAINT auth_password_reset_token_provider_identity_id_foreign FOREIGN KEY (provider_identity_id) REFERENCES public.provider_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_verification auth_verification_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_verification
    ADD CONSTRAINT auth_verification_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: capture capture_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capture
    ADD CONSTRAINT capture_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart cart_billing_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_billing_address_id_foreign FOREIGN KEY (billing_address_id) REFERENCES public.cart_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cart_line_item_adjustment cart_line_item_adjustment_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_line_item_adjustment
    ADD CONSTRAINT cart_line_item_adjustment_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.cart_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_line_item cart_line_item_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_line_item
    ADD CONSTRAINT cart_line_item_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_line_item_tax_line cart_line_item_tax_line_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_line_item_tax_line
    ADD CONSTRAINT cart_line_item_tax_line_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.cart_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart cart_shipping_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_shipping_address_id_foreign FOREIGN KEY (shipping_address_id) REFERENCES public.cart_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cart_shipping_method_adjustment cart_shipping_method_adjustment_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_shipping_method_adjustment
    ADD CONSTRAINT cart_shipping_method_adjustment_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.cart_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_shipping_method cart_shipping_method_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_shipping_method
    ADD CONSTRAINT cart_shipping_method_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_shipping_method_tax_line cart_shipping_method_tax_line_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_shipping_method_tax_line
    ADD CONSTRAINT cart_shipping_method_tax_line_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.cart_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: credit_line credit_line_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_line
    ADD CONSTRAINT credit_line_cart_id_foreign FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON UPDATE CASCADE;


--
-- Name: customer_address customer_address_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_address
    ADD CONSTRAINT customer_address_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_group_customer customer_group_customer_customer_group_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_group_customer
    ADD CONSTRAINT customer_group_customer_customer_group_id_foreign FOREIGN KEY (customer_group_id) REFERENCES public.customer_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_group_customer customer_group_customer_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_group_customer
    ADD CONSTRAINT customer_group_customer_customer_id_foreign FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dunning_attempt dunning_attempt_dunning_case_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dunning_attempt
    ADD CONSTRAINT dunning_attempt_dunning_case_id_foreign FOREIGN KEY (dunning_case_id) REFERENCES public.dunning_case(id) ON UPDATE CASCADE;


--
-- Name: fulfillment fulfillment_delivery_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_delivery_address_id_foreign FOREIGN KEY (delivery_address_id) REFERENCES public.fulfillment_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fulfillment_item fulfillment_item_fulfillment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_item
    ADD CONSTRAINT fulfillment_item_fulfillment_id_foreign FOREIGN KEY (fulfillment_id) REFERENCES public.fulfillment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fulfillment_label fulfillment_label_fulfillment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment_label
    ADD CONSTRAINT fulfillment_label_fulfillment_id_foreign FOREIGN KEY (fulfillment_id) REFERENCES public.fulfillment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fulfillment fulfillment_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.fulfillment_provider(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fulfillment fulfillment_shipping_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fulfillment
    ADD CONSTRAINT fulfillment_shipping_option_id_foreign FOREIGN KEY (shipping_option_id) REFERENCES public.shipping_option(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: geo_zone geo_zone_service_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.geo_zone
    ADD CONSTRAINT geo_zone_service_zone_id_foreign FOREIGN KEY (service_zone_id) REFERENCES public.service_zone(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: image image_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_level inventory_level_inventory_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_level
    ADD CONSTRAINT inventory_level_inventory_item_id_foreign FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.notification_provider(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order order_billing_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_billing_address_id_foreign FOREIGN KEY (billing_address_id) REFERENCES public.order_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_change_action order_change_action_order_change_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_change_action
    ADD CONSTRAINT order_change_action_order_change_id_foreign FOREIGN KEY (order_change_id) REFERENCES public.order_change(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_change order_change_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_change
    ADD CONSTRAINT order_change_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_credit_line order_credit_line_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_credit_line
    ADD CONSTRAINT order_credit_line_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_item order_item_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_item order_item_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_line_item_adjustment order_line_item_adjustment_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_line_item_adjustment
    ADD CONSTRAINT order_line_item_adjustment_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_line_item_tax_line order_line_item_tax_line_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_line_item_tax_line
    ADD CONSTRAINT order_line_item_tax_line_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.order_line_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_line_item order_line_item_totals_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_line_item
    ADD CONSTRAINT order_line_item_totals_id_foreign FOREIGN KEY (totals_id) REFERENCES public.order_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order order_shipping_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_shipping_address_id_foreign FOREIGN KEY (shipping_address_id) REFERENCES public.order_address(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_shipping_method_adjustment order_shipping_method_adjustment_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping_method_adjustment
    ADD CONSTRAINT order_shipping_method_adjustment_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.order_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_shipping_method_tax_line order_shipping_method_tax_line_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping_method_tax_line
    ADD CONSTRAINT order_shipping_method_tax_line_shipping_method_id_foreign FOREIGN KEY (shipping_method_id) REFERENCES public.order_shipping_method(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_shipping order_shipping_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_shipping
    ADD CONSTRAINT order_shipping_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_summary order_summary_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_summary
    ADD CONSTRAINT order_summary_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_transaction order_transaction_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_transaction
    ADD CONSTRAINT order_transaction_order_id_foreign FOREIGN KEY (order_id) REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_collection_payment_providers payment_collection_payment_providers_payment_col_aa276_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_collection_payment_providers
    ADD CONSTRAINT payment_collection_payment_providers_payment_col_aa276_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_collection_payment_providers payment_collection_payment_providers_payment_pro_2d555_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_collection_payment_providers
    ADD CONSTRAINT payment_collection_payment_providers_payment_pro_2d555_foreign FOREIGN KEY (payment_provider_id) REFERENCES public.payment_provider(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment payment_payment_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_payment_collection_id_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_session payment_session_payment_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_session
    ADD CONSTRAINT payment_session_payment_collection_id_foreign FOREIGN KEY (payment_collection_id) REFERENCES public.payment_collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_list_rule price_list_rule_price_list_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_list_rule
    ADD CONSTRAINT price_list_rule_price_list_id_foreign FOREIGN KEY (price_list_id) REFERENCES public.price_list(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price price_price_list_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_price_list_id_foreign FOREIGN KEY (price_list_id) REFERENCES public.price_list(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price price_price_set_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_price_set_id_foreign FOREIGN KEY (price_set_id) REFERENCES public.price_set(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_rule price_rule_price_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_rule
    ADD CONSTRAINT price_rule_price_id_foreign FOREIGN KEY (price_id) REFERENCES public.price(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_category product_category_parent_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category
    ADD CONSTRAINT product_category_parent_category_id_foreign FOREIGN KEY (parent_category_id) REFERENCES public.product_category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_category_product product_category_product_product_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category_product
    ADD CONSTRAINT product_category_product_product_category_id_foreign FOREIGN KEY (product_category_id) REFERENCES public.product_category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_category_product product_category_product_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_category_product
    ADD CONSTRAINT product_category_product_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product product_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_collection_id_foreign FOREIGN KEY (collection_id) REFERENCES public.product_collection(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_option_value product_option_value_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_option_value
    ADD CONSTRAINT product_option_value_option_id_foreign FOREIGN KEY (option_id) REFERENCES public.product_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_product_option product_product_option_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_product_option
    ADD CONSTRAINT product_product_option_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_product_option product_product_option_product_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_product_option
    ADD CONSTRAINT product_product_option_product_option_id_foreign FOREIGN KEY (product_option_id) REFERENCES public.product_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_product_option_value product_product_option_value_product_option_value_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_product_option_value
    ADD CONSTRAINT product_product_option_value_product_option_value_id_foreign FOREIGN KEY (product_option_value_id) REFERENCES public.product_option_value(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_product_option_value product_product_option_value_product_product_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_product_option_value
    ADD CONSTRAINT product_product_option_value_product_product_option_id_foreign FOREIGN KEY (product_product_option_id) REFERENCES public.product_product_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_tags product_tags_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_tags product_tags_product_tag_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_tag_id_foreign FOREIGN KEY (product_tag_id) REFERENCES public.product_tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product product_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_type_id_foreign FOREIGN KEY (type_id) REFERENCES public.product_type(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_variant_option product_variant_option_option_value_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_option_value_id_foreign FOREIGN KEY (option_value_id) REFERENCES public.product_option_value(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant_option product_variant_option_variant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_option
    ADD CONSTRAINT product_variant_option_variant_id_foreign FOREIGN KEY (variant_id) REFERENCES public.product_variant(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant product_variant_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant
    ADD CONSTRAINT product_variant_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant_product_image product_variant_product_image_image_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_product_image
    ADD CONSTRAINT product_variant_product_image_image_id_foreign FOREIGN KEY (image_id) REFERENCES public.image(id) ON DELETE CASCADE;


--
-- Name: promotion_application_method promotion_application_method_promotion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_application_method
    ADD CONSTRAINT promotion_application_method_promotion_id_foreign FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_campaign_budget promotion_campaign_budget_campaign_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_campaign_budget
    ADD CONSTRAINT promotion_campaign_budget_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES public.promotion_campaign(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_campaign_budget_usage promotion_campaign_budget_usage_budget_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_campaign_budget_usage
    ADD CONSTRAINT promotion_campaign_budget_usage_budget_id_foreign FOREIGN KEY (budget_id) REFERENCES public.promotion_campaign_budget(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion promotion_campaign_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion
    ADD CONSTRAINT promotion_campaign_id_foreign FOREIGN KEY (campaign_id) REFERENCES public.promotion_campaign(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: promotion_promotion_rule promotion_promotion_rule_promotion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_promotion_rule
    ADD CONSTRAINT promotion_promotion_rule_promotion_id_foreign FOREIGN KEY (promotion_id) REFERENCES public.promotion(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_promotion_rule promotion_promotion_rule_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_promotion_rule
    ADD CONSTRAINT promotion_promotion_rule_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_rule_value promotion_rule_value_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rule_value
    ADD CONSTRAINT promotion_rule_value_promotion_rule_id_foreign FOREIGN KEY (promotion_rule_id) REFERENCES public.promotion_rule(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: provider_identity provider_identity_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_identity
    ADD CONSTRAINT provider_identity_auth_identity_id_foreign FOREIGN KEY (auth_identity_id) REFERENCES public.auth_identity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refund refund_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund
    ADD CONSTRAINT refund_payment_id_foreign FOREIGN KEY (payment_id) REFERENCES public.payment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: region_country region_country_region_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.region_country
    ADD CONSTRAINT region_country_region_id_foreign FOREIGN KEY (region_id) REFERENCES public.region(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: renewal_attempt renewal_attempt_renewal_cycle_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.renewal_attempt
    ADD CONSTRAINT renewal_attempt_renewal_cycle_id_foreign FOREIGN KEY (renewal_cycle_id) REFERENCES public.renewal_cycle(id) ON UPDATE CASCADE;


--
-- Name: reservation_item reservation_item_inventory_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_item
    ADD CONSTRAINT reservation_item_inventory_item_id_foreign FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: retention_offer_event retention_offer_event_cancellation_case_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retention_offer_event
    ADD CONSTRAINT retention_offer_event_cancellation_case_id_foreign FOREIGN KEY (cancellation_case_id) REFERENCES public.cancellation_case(id) ON UPDATE CASCADE;


--
-- Name: return_reason return_reason_parent_return_reason_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_reason
    ADD CONSTRAINT return_reason_parent_return_reason_id_foreign FOREIGN KEY (parent_return_reason_id) REFERENCES public.return_reason(id);


--
-- Name: service_zone service_zone_fulfillment_set_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_zone
    ADD CONSTRAINT service_zone_fulfillment_set_id_foreign FOREIGN KEY (fulfillment_set_id) REFERENCES public.fulfillment_set(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_option shipping_option_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_provider_id_foreign FOREIGN KEY (provider_id) REFERENCES public.fulfillment_provider(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: shipping_option_rule shipping_option_rule_shipping_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option_rule
    ADD CONSTRAINT shipping_option_rule_shipping_option_id_foreign FOREIGN KEY (shipping_option_id) REFERENCES public.shipping_option(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_option shipping_option_service_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_service_zone_id_foreign FOREIGN KEY (service_zone_id) REFERENCES public.service_zone(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_option shipping_option_shipping_option_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_shipping_option_type_id_foreign FOREIGN KEY (shipping_option_type_id) REFERENCES public.shipping_option_type(id) ON UPDATE CASCADE;


--
-- Name: shipping_option shipping_option_shipping_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_option
    ADD CONSTRAINT shipping_option_shipping_profile_id_foreign FOREIGN KEY (shipping_profile_id) REFERENCES public.shipping_profile(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_location stock_location_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_location
    ADD CONSTRAINT stock_location_address_id_foreign FOREIGN KEY (address_id) REFERENCES public.stock_location_address(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: store_currency store_currency_store_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_currency
    ADD CONSTRAINT store_currency_store_id_foreign FOREIGN KEY (store_id) REFERENCES public.store(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: store_locale store_locale_store_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_locale
    ADD CONSTRAINT store_locale_store_id_foreign FOREIGN KEY (store_id) REFERENCES public.store(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 5LT3MZQLgoT25AjJHBvqeO3rckxc7bbk9pxhrZwtJnnfx2NZMh254BwOETUMOkf

