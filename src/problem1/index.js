// Implementation A: Mathematical formula (Gauss's formula)
var sum_to_n_a = function(n) {
    return n * (n + 1) / 2;
};

// Implementation B: Iterative loop
var sum_to_n_b = function(n) {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Implementation C: Recursion
var sum_to_n_c = function(n) {
    if (n <= 0) return 0;
    return n + sum_to_n_c(n - 1);
};
