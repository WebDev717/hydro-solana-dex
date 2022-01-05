#[cfg(test)]
mod tests {
    use hydra_math::math::{checked_pow_fraction, log, signed_addition, signed_mul, sqrt};
    use hydra_math::swap_result::SwapResult;
    use spl_math::precise_number::{PreciseNumber, ONE};
    use spl_math::uint::U256;

    type InnerUint = U256;

    #[test]
    fn test_precise_number_storage() {
        let pi_numerator = PreciseNumber::new(245850922u128).unwrap();
        let pi_denominator = PreciseNumber::new(78256779u128).unwrap();

        let swap = SwapResult {
            k: PreciseNumber::new(1_000_000u128).unwrap(),
            x_new: PreciseNumber::new(1010u128).unwrap(),
            y_new: PreciseNumber::new(990u128).unwrap(),
            delta_x: PreciseNumber::new(10u128).unwrap(),
            delta_y: pi_numerator.checked_div(&pi_denominator).expect("pi"),
        };
        // Test imprecise conversion
        assert_eq!(swap.k.to_imprecise().expect("u128"), 1_000_000u128);

        // Test precision up to 12 decimal places
        // 3.141592653589
        let precision = InnerUint::from(ONE);
        let expected = PreciseNumber {
            value: InnerUint::from(3_141_592_653_589u128),
        };
        assert!(swap.delta_y.almost_eq(&expected, precision));
    }

    #[test]
    fn test_u128_square_root() {
        // largest containing 1 to 9 once
        let x = 923_187_456u128;
        assert_eq!(sqrt(x), 30_384u128);

        // largest containing 1 to 9 two times
        let x = 998_781_235_573_146_624u128;
        assert_eq!(sqrt(x), 999_390_432u128);

        // largest containing 1 to 9 three times
        let x = 999_888_767_225_363_175_346_145_124u128;
        assert_eq!(sqrt(x), 31_621_017_808_182u128);

        let x = u128::MAX;
        assert_eq!(sqrt(x), 18_446_744_073_709_551_616u128);
    }

    #[test]
    fn test_u128_natural_log() {
        // ln(1) = 0
        assert_eq!(log(1u128), PreciseNumber::new(0u128).unwrap());

        // ln(1000) = 6.907755278982137
        let precision = InnerUint::from(ONE);
        let expected = PreciseNumber {
            value: InnerUint::from(6_907_755_278_982u128),
        };
        assert!(log(1_000u128).almost_eq(&expected, precision));

        // ln(18446744073709551615) = 44.3614195558365
        let expected = PreciseNumber {
            value: InnerUint::from(44_361_419_555_836u128),
        };
        assert!(log(u64::MAX as u128).almost_eq(&expected, precision));

        // TODO: this overflows
        // ln(340282366920938463463374607431768211455 = 88.722839111673
        // assert_eq!(log(u128::MAX), PreciseNumber::new(0u128).unwrap());
    }

    #[test]
    fn test_checked_pow_fraction() {
        let precision = InnerUint::from(ONE);
        let base = PreciseNumber::new(42u128).unwrap();
        let exp: PreciseNumber;
        // 42^0 = 1
        let exp = PreciseNumber::new(0u128).unwrap();
        assert_eq!(
            checked_pow_fraction(&base, &exp),
            PreciseNumber::new(1u128).unwrap()
        );

        // 42^0.25 = 2.545729895021831
        let exp = PreciseNumber::new(1u128)
            .unwrap()
            .checked_div(&PreciseNumber::new(4u128).unwrap())
            .unwrap();
        let expected = PreciseNumber {
            value: InnerUint::from(2_545_729_895_021u128),
        };
        assert!(checked_pow_fraction(&base, &exp).almost_eq(&expected, precision));

        // 42^0.5 = 6.48074069840786
        let exp = PreciseNumber::new(1u128)
            .unwrap()
            .checked_div(&PreciseNumber::new(2u128).unwrap())
            .unwrap();
        let expected = PreciseNumber {
            value: InnerUint::from(6_480_740_698_407u128),
        };
        assert!(checked_pow_fraction(&base, &exp).almost_eq(&expected, precision));

        // 42^1 = 42
        let exp = PreciseNumber::new(1u128).unwrap();
        assert_eq!(
            checked_pow_fraction(&base, &exp),
            PreciseNumber::new(42u128).unwrap()
        );

        // 42^1.25 = 106.920655590916882
        let exp = PreciseNumber::new(5u128)
            .unwrap()
            .checked_div(&PreciseNumber::new(4u128).unwrap())
            .unwrap();
        let expected = PreciseNumber {
            value: InnerUint::from(106_920_655_590_916u128),
        };
        assert!(checked_pow_fraction(&base, &exp).almost_eq(&expected, precision));

        // 42^1.5 = 272.19110933313013
        let exp = PreciseNumber::new(3u128)
            .unwrap()
            .checked_div(&PreciseNumber::new(2u128).unwrap())
            .unwrap();
        let expected = PreciseNumber {
            value: InnerUint::from(272_191_109_333_130u128),
        };
        assert!(checked_pow_fraction(&base, &exp).almost_eq(&expected, precision));

        // 42^2 = 1764
        let exp = PreciseNumber::new(2u128).unwrap();
        assert_eq!(
            checked_pow_fraction(&base, &exp),
            PreciseNumber::new(1764u128).unwrap()
        );
    }

    #[test]
    fn test_signed_addition() {
        // -4 + -3 = -7
        let lhs = PreciseNumber::new(4).unwrap();
        let lhs_signed = true;
        let rhs = PreciseNumber::new(3).unwrap();
        let rhs_signed = true;
        let expected = PreciseNumber::new(7).unwrap();
        let expected_signed = true;
        assert_eq!(
            signed_addition(&lhs, lhs_signed, &rhs, rhs_signed),
            (expected, expected_signed)
        );

        // -1 + 1 = 0
        let lhs = PreciseNumber::new(1).unwrap();
        let lhs_signed = true;
        let rhs = PreciseNumber::new(1).unwrap();
        let rhs_signed = false;
        let expected = PreciseNumber::new(0).unwrap();
        let expected_signed = false;
        assert_eq!(
            signed_addition(&lhs, lhs_signed, &rhs, rhs_signed),
            (expected, expected_signed)
        );

        // 3 + -5 = -2
        let lhs = PreciseNumber::new(3).unwrap();
        let lhs_signed = false;
        let rhs = PreciseNumber::new(5).unwrap();
        let rhs_signed = true;
        let expected = PreciseNumber::new(2).unwrap();
        let expected_signed = true;
        assert_eq!(
            signed_addition(&lhs, lhs_signed, &rhs, rhs_signed),
            (expected, expected_signed)
        );

        // -5 + 3 = -2
        let lhs = PreciseNumber::new(5).unwrap();
        let lhs_signed = true;
        let rhs = PreciseNumber::new(3).unwrap();
        let rhs_signed = false;
        let expected = PreciseNumber::new(2).unwrap();
        let expected_signed = true;
        assert_eq!(
            signed_addition(&lhs, lhs_signed, &rhs, rhs_signed),
            (expected, expected_signed)
        );

        // 5 + -2 = 3
        let lhs = PreciseNumber::new(5).unwrap();
        let lhs_signed = false;
        let rhs = PreciseNumber::new(2).unwrap();
        let rhs_signed = true;
        let expected = PreciseNumber::new(3).unwrap();
        let expected_signed = false;
        assert_eq!(
            signed_addition(&lhs, lhs_signed, &rhs, rhs_signed),
            (expected, expected_signed)
        );

        // -3 + 5 = 2
        let lhs = PreciseNumber::new(3).unwrap();
        let lhs_signed = true;
        let rhs = PreciseNumber::new(5).unwrap();
        let rhs_signed = false;
        let expected = PreciseNumber::new(2).unwrap();
        let expected_signed = false;
        assert_eq!(
            signed_addition(&lhs, lhs_signed, &rhs, rhs_signed),
            (expected, expected_signed)
        );

        // 1 + -2 = -1
        let lhs = PreciseNumber::new(1).unwrap();
        let lhs_signed = false;
        let rhs = PreciseNumber::new(2).unwrap();
        let rhs_signed = true;
        let expected = PreciseNumber::new(1).unwrap();
        let expected_signed = true;
        assert_eq!(
            signed_addition(&lhs, lhs_signed, &rhs, rhs_signed),
            (expected, expected_signed)
        );

        // 4 + 3 = 7
        let lhs = PreciseNumber::new(4).unwrap();
        let lhs_signed = false;
        let rhs = PreciseNumber::new(3).unwrap();
        let rhs_signed = false;
        let expected = PreciseNumber::new(7).unwrap();
        let expected_signed = false;
        assert_eq!(
            signed_addition(&lhs, lhs_signed, &rhs, rhs_signed),
            (expected, expected_signed)
        );
    }

    #[test]
    fn test_signed_mul() {
        // -4 * -3 = 12
        let lhs = PreciseNumber::new(4).unwrap();
        let lhs_signed = true;
        let rhs = PreciseNumber::new(3).unwrap();
        let rhs_signed = true;
        let expected = PreciseNumber::new(12).unwrap();
        let expected_signed = false;
        assert_eq!(
            signed_mul(&lhs, lhs_signed, &rhs, rhs_signed),
            (expected, expected_signed)
        );

        // -4 * 3 = -12
        let lhs = PreciseNumber::new(4).unwrap();
        let lhs_signed = true;
        let rhs = PreciseNumber::new(3).unwrap();
        let rhs_signed = false;
        let expected = PreciseNumber::new(12).unwrap();
        let expected_signed = true;
        assert_eq!(
            signed_mul(&lhs, lhs_signed, &rhs, rhs_signed),
            (expected, expected_signed)
        );

        // 4 * -3 = -12
        let lhs = PreciseNumber::new(4).unwrap();
        let lhs_signed = false;
        let rhs = PreciseNumber::new(3).unwrap();
        let rhs_signed = true;
        let expected = PreciseNumber::new(12).unwrap();
        let expected_signed = true;
        assert_eq!(
            signed_mul(&lhs, lhs_signed, &rhs, rhs_signed),
            (expected, expected_signed)
        );

        // 4 * 3 = 12
        let lhs = PreciseNumber::new(4).unwrap();
        let lhs_signed = false;
        let rhs = PreciseNumber::new(3).unwrap();
        let rhs_signed = false;
        let expected = PreciseNumber::new(12).unwrap();
        let expected_signed = false;
        assert_eq!(
            signed_mul(&lhs, lhs_signed, &rhs, rhs_signed),
            (expected, expected_signed)
        );
    }
}