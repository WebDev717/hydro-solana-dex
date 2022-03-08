//! Result storage
use spl_math::precise_number::PreciseNumber;

#[derive(Debug)]
/// Encodes all results of swapping from a source token to a destination token
pub struct SwapResult {
    /// Invariant expressed as k
    pub k: PreciseNumber,
    /// New source amount expressed as x_new
    pub x_new: PreciseNumber,
    /// New destination amount expressed as y_new
    pub y_new: PreciseNumber,
    /// Amount of source token swapped expressed as delta_x
    pub delta_x: PreciseNumber,
    /// Amount of destination token swapped expressed as delta_x
    pub delta_y: PreciseNumber,
}

impl SwapResult {
    pub fn delta_y(&self) -> Option<u64> {
        Some(self.delta_y.to_imprecise()? as u64)
    }

    pub fn delta_x(&self) -> Option<u64> {
        Some(self.delta_x.to_imprecise()? as u64)
    }
}
